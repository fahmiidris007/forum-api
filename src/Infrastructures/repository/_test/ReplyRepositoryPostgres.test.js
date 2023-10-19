const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  beforeAll(async () => {
    const userId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
    await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });
  });
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add new comment', async () => {
      const newReply = new AddReply({
        content: 'lorem ipsum',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const addedReply = await replyRepositoryPostgres.addReply(
        'comment-123',
        newReply,
        'user-123',
      );
      const reply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: `reply-${fakeIdGenerator()}`,
          content: 'lorem ipsum',
          owner: 'user-123',
        }),
      );
      expect(reply).toBeDefined();
    });
  });

  describe('verifyAvailableReply function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(
        replyRepositoryPostgres.verifyAvailableReply('reply-xxx'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment found', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'lorem ipsum',
        owner: 'user-123',
      });

      expect(
        replyRepositoryPostgres.verifyAvailableReply('reply-123'),
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyAccess function', () => {
    it('should throw error if user has not access', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: 'user-123',
      });

      await expect(
        replyRepositoryPostgres.verifyReplyAccess('reply-123', 'user-xxx'),
      ).rejects.toThrowError(AuthorizationError);
    });
    it('should not throw error if user has access', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await RepliesTableTestHelper.addReply({});

      await expect(
        replyRepositoryPostgres.verifyReplyAccess('reply-123', 'user-123'),
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('getReplyById function', () => {
    it('should return empty array if no comment are found', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getReplyById([
        'comment-xxx',
      ]);

      expect(replies).toEqual([]);
    });
    it('should return all comments from a thread', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'lorem ipsum',
        owner: 'user-123',
      });

      const [reply] = await replyRepositoryPostgres.getReplyById('comment-123');

      expect(reply.id).toStrictEqual('reply-123');
      expect(reply.username).toStrictEqual('dicoding');
      expect(reply.content).toStrictEqual('lorem ipsum');
    });
  });

  describe('deleteCommentById', () => {
    it('should throw error when comment that wants to be deleted does not exist', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(
        replyRepositoryPostgres.deleteReplyById('reply-xxx'),
      ).rejects.toThrowError(NotFoundError);
    });
    it('should be able to delete added comment by id', async () => {
      const addedReply = {
        id: 'reply-123',
        owner: 'user-123',
      };

      await RepliesTableTestHelper.addReply({
        id: addedReply.id,
        owner: addedReply.owner,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await replyRepositoryPostgres.deleteReplyById(addedReply.id);
      const reply = await RepliesTableTestHelper.findReplyById(addedReply.id);

      expect(reply.length).toEqual(1);
      expect(reply[0].is_deleted).toEqual(true);
    });
  });
});
