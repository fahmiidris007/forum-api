const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgress');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add new thread', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      const newThread = new AddThread({
        title: 'Thread Title',
        body: 'lorem ipsum',
        owner: 'user-123',
      });

      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      const thread = await ThreadsTableTestHelper.findThreadsById('user-123');
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: `thread-${fakeIdGenerator()}`,
          title: 'Thread Title',
          owner: 'user-123',
        }),
      );
      expect(thread).toBeDefined();
    });

    it('should return added thread correctly', async () => {
      await UsersTableTestHelper.addUser({});
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );
      const newThread = new AddThread({
        title: 'Thread Title',
        body: 'lorem ipsum',
        owner: 'user-123',
      });
      const expectedThread = new AddedThread({
        id: `thread-${fakeIdGenerator()}`,
        title: 'Thread Title',
        owner: 'user-123',
      });

      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      expect(addedThread).toStrictEqual(expectedThread);
    });
  });

  describe('verifyAvailableThread function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(
        threadRepositoryPostgres.verifyAvailableThread('thread-xxx'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread({});

      await expect(
        threadRepositoryPostgres.verifyAvailableThread('thread-123'),
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(
        threadRepositoryPostgres.getThreadById('thread-xxx'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should return detail thread correctly when is found', async () => {
      const expectedThread = {
        id: 'thread-123',
        title: 'Thread Title',
        body: 'lorem ipsum',
        owner: 'user-123',
      };
      const userThread = {
        id: 'user-123',
        username: 'user-123',
      };
      await UsersTableTestHelper.addUser(userThread);
      await ThreadsTableTestHelper.addThread(expectedThread);
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const detailThread = await threadRepositoryPostgres.getThreadById(
        expectedThread.id,
      );

      expect(detailThread).toBeDefined();
      expect(detailThread.id).toEqual(expectedThread.id);
      expect(detailThread.title).toEqual(expectedThread.title);
      expect(detailThread.body).toEqual(expectedThread.body);
      expect(detailThread.username).toEqual(userThread.username);
    });
  });
});
