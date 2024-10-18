import { Inject, Injectable } from '@nestjs/common';
import { QueueManager } from '../entity/queue-manager';
import { Session } from '../entity/session';
import {
  SESSION_COUNTER_READER_REPOSITORY,
  SessionCounterReaderRepository,
} from '../repository/session-counter-reader.interface';
import {
  SESSION_COUNTER_WRITER_REPOSITORY,
  SessionCounterWriterRepository,
} from '../repository/session-counter-writer.interface';
import {
  SESSION_READER_REPOSITORY,
  SessionReaderRepository,
} from '../repository/session-reader.interface';
import {
  SESSION_WRITER_REPOSITORY,
  SessionWriterRepository,
} from '../repository/session-writer.interface';

@Injectable()
export class QueueService {
  constructor(
    @Inject(SESSION_READER_REPOSITORY)
    private readonly sessionReader: SessionReaderRepository,
    @Inject(SESSION_WRITER_REPOSITORY)
    private readonly sessionWriter: SessionWriterRepository,
    @Inject(SESSION_COUNTER_READER_REPOSITORY)
    private readonly sessionCounterReader: SessionCounterReaderRepository,
    @Inject(SESSION_COUNTER_WRITER_REPOSITORY)
    private readonly sessionCounterWriter: SessionCounterWriterRepository,
  ) {}

  async createSession(userId: number): Promise<Session> {
    const waitingNumber =
      await this.sessionCounterWriter.increaseCreatedCount();
    const session = Session.of(userId, waitingNumber);
    const savedSession = await this.sessionWriter.save(session);

    return savedSession;
  }

  async getSession(sessionId: number): Promise<Session> {
    return this.sessionReader.getByIdOrThrow(sessionId);
  }

  async getRemainingCountOf(sessionId: number): Promise<number> {
    const session = await this.sessionReader.getByIdOrThrow(sessionId);
    const counter = await this.sessionCounterReader.get();
    const manager = new QueueManager(
      counter.createdCount,
      counter.terminatedCount,
    );

    return manager.getRemainingCount(session.waitingNumber);
  }

  async isAccessible(sessionId: number): Promise<boolean> {
    const session = await this.sessionReader.getByIdOrThrow(sessionId);
    const counter = await this.sessionCounterReader.get();
    const manager = new QueueManager(
      counter.createdCount,
      counter.terminatedCount,
    );

    return manager.isAccessible(session.waitingNumber);
  }

  async terminateSession(sessionId: number): Promise<void> {
    const session = await this.sessionReader.getByIdOrThrow(sessionId);
    session.terminate();
    await this.sessionWriter.save(session);
    await this.sessionCounterWriter.increaseTerminatedCount();
  }
}
