import { enableLogging } from '../src/logger';
import { Server } from '../src/server';
import { EnvironmentInfo } from '../src/envInfo';
import { SafeEmitter } from '../src/events';
import { log } from 'fzi-iota-showcase-client';
import { Router, Emitter, Vehicle, Mover } from 'fzi-iota-showcase-vehicle-mock';

(async () => {
  const info: EnvironmentInfo = {
    vehicles: [{
      balance: 42,
      id: 'ABC',
      name: 'Lukas',
      position: {
        lat: 49.009525,
        lng: 8.405141,
      },
       info: {
         type: 'tram',
         co2emission: 90000,
         speed: 50,
       },
    }],
    users: [],
    stops: [{
      id: 'A',
      name: 'Marktplatz',
      position: {
        lat:  49.009525,
        lng: 8.405141,
      },
    }, {
      id: 'B',
      name: 'Kronenplatz',
      position: {
        lat: 49.009380,
        lng: 8.408518,
      },
    }, {
      id: 'C',
      name: 'Rüppurer Tor',
      position: {
        lat: 49.005752,
        lng: 8.410360,
      },
    }],
    connections: [{
      from: 'A',
      to: 'B',
      type: 'tram',
      path: [{
        lat: 49.009540,
        lng: 8.403885,
      }, {
        lat: 49.009380,
        lng: 8.408518,
      }],
    }, {
      from: 'B',
      to: 'C',
      type: 'tram',
      path: [{
        lat: 49.009380,
        lng: 8.408518,
      }, {
        lat: 49.009304,
        lng: 8.410162,
      }, {
        lat: 49.007649,
        lng: 8.409987,
      }, {
        lat: 49.005752,
        lng: 8.410360,
      }],
    }, {
      from: 'B',
      to: 'C',
      type: 'car',
      path: [{
        lat: 49.009380,
        lng: 8.408518,
      }, {
        lat: 49.009304,
        lng: 8.410262,
      }, {
        lat: 49.007649,
        lng: 8.410087,
      }, {
        lat: 49.005752,
        lng: 8.410460,
      }],
    }],
  };
  const events = new SafeEmitter();
  enableLogging(events);
  new Server(events, info).listen();

  events.onIntern('start', async () => {
    const e: Emitter = {
      posUpdated(pos) {
        info.vehicles[0].position = pos;
        events.emit('PosUpdated', {id: 'ABC', position: pos});
      },
    };
    const v = new Vehicle(e, 'SEED', info.stops[0],
      {co2emission: 0, speed: 83, type: 'tram'});
    const mover = new Mover(v);
    const router = new Router(info.connections);
    const route = router.getRoutes(v.stop!, 'C', v.info.type)[0];
    mover.startDriving(route, (stop) => log.info('Reached stop %s', stop))
      .then((end) => log.info('Stopped at %s', end));
    // setInterval(() => mover.stopDrivingAtNextStop(), 2000);
  });
})();
