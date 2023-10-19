const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddComments = require('../../../Domains/comments/entities/AddComment');
const AddedComments = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  beforeAll(async () => {
    const userId = 'user-123';
    const threadId = 'thread-123';
    await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
  });
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add new comment', async () => {
      const newComment = new AddComments({
        content: 'lorem ipsum',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const addedComment = await commentRepositoryPostgres.addComment(
        'thread-123',
        newComment,
        'user-123',
      );

      const comment =
        await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(addedComment).toStrictEqual(
        new AddedComments({
          id: `comment-${fakeIdGenerator()}`,
          content: 'lorem ipsum',
          owner: 'user-123',
        }),
      );
      expect(comment).toBeDefined();
    });
  });

  describe('verifyAvailableThread function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
      });
      await expect(
        commentRepositoryPostgres.verifyAvailableComment(
          'thread-xxx',
          'comment-xxx',
        ),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
      });
      await expect(
        commentRepositoryPostgres.verifyAvailableComment(
          'comment-123',
          'thread-123',
        ),
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentAccess', () => {
    it('should throw error if user has not access', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-xxx' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await expect(
        commentRepositoryPostgres.verifyCommentAccess({
          commentId: 'comment-123',
          owner: 'user-xxx',
        }),
      ).rejects.toThrowError(AuthorizationError);
    });
    it('should not throw error if user has access', async () => {
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await expect(
        commentRepositoryPostgres.verifyCommentAccess(
          'comment-123',
          'user-123',
        ),
      ).resolves.toBeUndefined();
    });
  });

  describe('getCommentById function', () => {
    it('should return empty array if no comment are found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const detailComment =
        await commentRepositoryPostgres.getCommentById('thread-123');
      expect(detailComment).toStrictEqual([]);
    });
    it('should return all comments from a thread', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'lorem ipsum',
        owner: 'user-123',
      });

      const [comment] =
        await commentRepositoryPostgres.getCommentById('thread-123');

      expect(comment.id).toStrictEqual('comment-123');
      expect(comment.username).toStrictEqual('dicoding');
      expect(comment.content).toStrictEqual('lorem ipsum');
      expect(comment.date.getDate()).toStrictEqual(new Date().getDate());
      expect(comment.isDeleted).toEqual(false);
    });
  });

  describe('deleteCommentById', () => {
    it('should throw error when comment that wants to be deleted does not exist', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(
        commentRepositoryPostgres.deleteCommentById('comment-xxx'),
      ).rejects.toThrowError(NotFoundError);
    });
    it('should be able to delete added comment by id', async () => {
      const addedComment = {
        id: 'comment-123',
        threadId: 'thread-123',
      };

      await CommentsTableTestHelper.addComment({
        id: addedComment.id,
        threadId: addedComment.threadId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await commentRepositoryPostgres.deleteCommentById(addedComment.id);
      const comment = await CommentsTableTestHelper.findCommentsById(
        addedComment.id,
      );

      expect(comment.length).toEqual(1);
      expect(comment[0].is_deleted).toEqual(true);
    });
  });
});
