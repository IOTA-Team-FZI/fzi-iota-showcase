import { VehicleInfo, createAttachToTangle, Logger, ChainedMessageBuilder} from 'fzi-iota-showcase-client';
const {log} = Logger;
const {buildObject} = ChainedMessageBuilder;
import { RAAM } from 'raam.client.js';
import { API, composeAPI } from '@iota/core';
import { MamWriter, MAM_MODE, MamReader } from 'mam.ts';

async function createMasterChannel(iota: API, seed: string, capacity: number) {
  const raam = await RAAM.fromSeed(seed, {amount: capacity, iota, security: 1});
  log.debug('Vehicle channel created');
  return raam;
}

async function publishMetaInfoRoot(raam: RAAM, root: string) {
  const hash = await raam.publish(root);
  log.debug('Published metaInfo root');
  return {hash, raam};
}

export async function readMetaInfo(provider: string, channelRoot: string) {
  const reader = new MamReader(provider, channelRoot);
  const messages = await reader.fetch();
  log.debug('Read metaInfo: %O', messages);
  return buildObject(messages.map((s) => JSON.parse(s)));
}

async function publishMetaInfo(writer: MamWriter, info: VehicleInfo) {
  const tx = await writer.createAndAttach(JSON.stringify({put: info}));
  log.debug('Published metaInfo');
  return tx;
}

export async function publishVehicle(provider: string, seed: string, capacity: number, vehicleInfo: VehicleInfo) {
  const infoChannel = new MamWriter(provider, seed, MAM_MODE.PUBLIC);
  infoChannel.EnablePowSrv(true);
  const root = infoChannel.getNextRoot();

  const iota = composeAPI({
    provider,
    attachToTangle: createAttachToTangle(),
  });

  const [{hash, raam}, tx] = await Promise.all([
    createMasterChannel(iota, seed, capacity).then((masterChannel) => publishMetaInfoRoot(masterChannel, root)),
    publishMetaInfo(infoChannel, vehicleInfo),
  ]);
  return {raam, root, tx};
}
