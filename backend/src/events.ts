import { Trytes, Hash } from '@iota/core/typings/types';
import { Position, User } from './envInfo';
import { EventEmitter2, Listener, EventAndListener } from 'eventemitter2';

export class SafeEmitter {
  public static PUBLIC = 'public';
  public static INTERN = 'intern';

  constructor(
    private readonly events: EventEmitter2 = new EventEmitter2({
      wildcard: true,
    }),
  ) {}

  public emit(...event: Event) {
    this.events.emit([SafeEmitter.PUBLIC, event[0]], event[1]);
  }

  public emitIntern(type: string, ...data: any[]) {
    this.events.emit([SafeEmitter.INTERN, type], ...data);
  }

  public on<T extends Event, D extends T[1]>(
    type: T[0],
    listener: (...data: D[]) => void,
  ) {
    this.events.on([SafeEmitter.PUBLIC, type], listener);
  }

  public onIntern(type: string, listener: Listener) {
    this.events.on([SafeEmitter.INTERN, type], listener);
  }

  public offIntern(type: string, listener: Listener) {
    this.events.off(SafeEmitter.INTERN + '.' + type, listener);
  }

  public onAny(listener: EventAndListener) {
    this.events.onAny(listener);
  }
}

// new SafeEmitter(new EventEmitter2()).on('Login', (data: Login) => {
//   console.log(data.id);
// });

export type Event =
  | ['CheckIn', CheckIn]
  | ['Login', Login]
  | ['ReservationIssued', ReservationIssued]
  | ['ReservationExpired', ReservationExpired]
  | ['BoardingStarted', BoardingStarted]
  | ['TripStarted', TripStarted]
  | ['TripFinished', TripFinished]
  | ['PosUpdated', PosUpdated]
  | ['Logout', Logout]
  | ['TransactionIssued', TransactionIssued];

export interface CheckIn {
  stopId: Trytes;
  vehicleId: Trytes;
}

export interface Login {
  id: Trytes;
  name: string;
  position: Position;
  balance: number;
  stop?: Hash;
}

export interface ReservationIssued {
  userId: Trytes;
  vehicleId: Trytes;
}

export interface ReservationExpired {
  userId: Trytes;
  vehicleId: Trytes;
}

export interface BoardingStarted {
  userId: Trytes;
  vehicleId: Trytes;
  destination: Trytes;
}

export interface TripStarted {
  userId: Trytes;
  vehicleId: Trytes;
}

export interface TripFinished {
  userId: Trytes;
  vehicleId: Trytes;
}

export interface PosUpdated {
  id: Trytes;
  position: Position;
}

export interface TransactionIssued {
  from: Trytes;
  to: Trytes;
  amount: number;
}

export interface Logout {
  userId: Trytes;
}
