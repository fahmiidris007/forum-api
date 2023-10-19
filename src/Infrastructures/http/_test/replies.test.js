const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      const requestAddUser = {
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };

      const requestThreadPayload = {
        title: 'Thread Title',
        body: 'lorem ipsum',
      };

      const requestCommentPayload = {
        id: 'comment-123',
        content: 'lorem ipsum',
      };

      const requestReplyPayload = { content: 'lorem ipsum' };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: requestAddUser.username,
          password: requestAddUser.password,
          fullname: requestAddUser.fullname,
        },
      });

      const responseAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestAddUser.username,
          password: requestAddUser.password,
        },
      });

      const responseAuthJson = JSON.parse(responseAuth.payload);
      const accessToken = responseAuthJson.data.accessToken;

      const responseAddThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          id: 'thread-123',
          title: requestThreadPayload.title,
          body: requestThreadPayload.body,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseAddThreadJson = JSON.parse(responseAddThread.payload);
      const threadId = responseAddThreadJson.data.addedThread.id;

      const responseAddComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestCommentPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseAddCommentJson = JSON.parse(responseAddComment.payload);
      const commentId = responseAddCommentJson.data.addedComment.id;

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestReplyPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 401 when the request does not have an authentication', async () => {
      const requestAddUser = {
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };

      const requestThreadPayload = {
        id: 'thread-123',
        title: 'Thread Title',
        body: 'lorem ipsum',
      };

      const requestCommentPayload = {
        id: 'comment-123',
        content: 'lorem ipsum',
      };

      const requestReplyPayload = {
        id: 'reply-123',
        content: 'lorem ipsum',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: requestAddUser.username,
          password: requestAddUser.password,
          fullname: requestAddUser.fullname,
        },
      });

      const responseAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestAddUser.username,
          password: requestAddUser.password,
        },
      });

      const responseAuthJson = JSON.parse(responseAuth.payload);
      const accessToken = responseAuthJson.data.accessToken;

      const responseAddThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestThreadPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseAddThreadJson = JSON.parse(responseAddThread.payload);
      const threadId = responseAddThreadJson.data.addedThread.id;

      const responseAddComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestCommentPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseAddCommentJson = JSON.parse(responseAddComment.payload);
      const commentId = responseAddCommentJson.data.addedComment.id;

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestReplyPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toBeDefined();
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 status when request a bad payload', async () => {
      const requestAddUser = {
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };

      const requestThreadPayload = {
        id: 'thread-123',
        title: 'Thread Title',
        body: 'lorem ipsum',
      };

      const requestCommentPayload = {
        id: 'comment-123',
        content: 'lorem ipsum',
      };

      const requestReplyPayload = { content: 400 };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: requestAddUser.username,
          password: requestAddUser.password,
          fullname: requestAddUser.fullname,
        },
      });

      const responseAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestAddUser.username,
          password: requestAddUser.password,
        },
      });

      const responseAuthJson = JSON.parse(responseAuth.payload);
      const accessToken = responseAuthJson.data.accessToken;

      const responseAddThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestThreadPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseAddThreadJson = JSON.parse(responseAddThread.payload);
      const threadId = responseAddThreadJson.data.addedThread.id;

      const responseAddComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestCommentPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseAddCommentJson = JSON.parse(responseAddComment.payload);
      const commentId = responseAddCommentJson.data.addedComment.id;

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestReplyPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tipe data tidak sesuai');
    });

    it('should response 404 status when the thread or comment is not found', async () => {
      const requestAddUser = {
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };

      const requestReplyPayload = { content: 'lorem ipsum' };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: requestAddUser.username,
          password: requestAddUser.password,
          fullname: requestAddUser.fullname,
        },
      });

      const responseAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestAddUser.username,
          password: requestAddUser.password,
        },
      });

      const responseAuthJson = JSON.parse(responseAuth.payload);
      const accessToken = responseAuthJson.data.accessToken;

      const responseAddThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseAddThreadJson = JSON.parse(responseAddThread.payload);
      const threadId = responseAddThreadJson.data;

      const responseAddComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseAddCommentJson = JSON.parse(responseAddComment.payload);
      const commentId = responseAddCommentJson.data;

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestReplyPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and persisted delete reply', async () => {
      const requestAddUser = {
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };

      const requestAddThreadPayload = {
        title: 'new thread',
        body: 'new thread body',
      };

      const requestAddCommentPayload = {
        content: 'new comment',
      };

      const requestAddReplyPayload = {
        content: 'new reply',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: requestAddUser.username,
          password: requestAddUser.password,
          fullname: requestAddUser.fullname,
        },
      });

      const responseAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestAddUser.username,
          password: requestAddUser.password,
        },
      });
      const responseAuthJson = JSON.parse(responseAuth.payload);
      const accessToken = responseAuthJson.data.accessToken;

      const responseAddThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestAddThreadPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseAddThreadJson = JSON.parse(responseAddThread.payload);
      const threadId = responseAddThreadJson.data.addedThread.id;

      const responseAddComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestAddCommentPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseAddCommentJson = JSON.parse(responseAddComment.payload);
      const commentId = responseAddCommentJson.data.addedComment.id;

      const responseAddReply = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestAddReplyPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseAddReplyJson = JSON.parse(responseAddReply.payload);
      const replyId = responseAddReplyJson.data.addedReply.id;

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 when the request does not have an authentication', async () => {
      const requestAddUser = {
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };

      const requestAddThreadPayload = {
        title: 'new thread',
        body: 'new thread body',
      };

      const requestAddCommentPayload = {
        content: 'new comment',
      };

      const requestAddReplyPayload = {
        content: 'new reply',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: requestAddUser.username,
          password: requestAddUser.password,
          fullname: requestAddUser.fullname,
        },
      });

      const responseAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestAddUser.username,
          password: requestAddUser.password,
        },
      });
      const responseAuthJson = JSON.parse(responseAuth.payload);
      const accessToken = responseAuthJson.data.accessToken;

      const responseAddThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestAddThreadPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseAddThreadJson = JSON.parse(responseAddThread.payload);
      const threadId = responseAddThreadJson.data.addedThread.id;

      const responseAddComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestAddCommentPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseAddCommentJson = JSON.parse(responseAddComment.payload);
      const commentId = responseAddCommentJson.data.addedComment.id;

      const responseAddReply = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestAddReplyPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseAddReplyJson = JSON.parse(responseAddReply.payload);
      const replyId = responseAddReplyJson.data.addedReply.id;

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toBeDefined();
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 403 when user request not authorized', async () => {
      const requestAddUser = {
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };

      const requestAuthPayload1 = {
        username: requestAddUser.username,
        password: requestAddUser.password,
      };

      const requestAuthPayload2 = {
        username: 'dicoding2',
        password: 'supersecret',
      };

      const requestAddThreadPayload = {
        title: 'new thread',
        body: 'new thread body',
      };

      const requestAddCommentPayload = {
        content: 'new comment',
      };

      const requestAddReplyPayload = {
        content: 'new reply',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: requestAuthPayload1.username,
          password: requestAuthPayload1.password,
          fullname: requestAddUser.fullname,
        },
      });

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: requestAuthPayload2.username,
          password: requestAuthPayload2.password,
          fullname: requestAddUser.fullname,
        },
      });

      const responseAuth1 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestAuthPayload1,
      });
      const responseAuthJson1 = JSON.parse(responseAuth1.payload);
      const accessToken1 = responseAuthJson1.data.accessToken;

      const responseAuth2 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestAuthPayload2,
      });
      const responseAuthJson2 = JSON.parse(responseAuth2.payload);
      const accessToken2 = responseAuthJson2.data.accessToken;

      const responseAddThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestAddThreadPayload,
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });
      const responseAddThreadJson = JSON.parse(responseAddThread.payload);
      const threadId = responseAddThreadJson.data.addedThread.id;

      const responseAddComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestAddCommentPayload,
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      const responseAddCommentJson = JSON.parse(responseAddComment.payload);
      const commentId = responseAddCommentJson.data.addedComment.id;

      const responseAddReply = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestAddReplyPayload,
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });
      const responseAddReplyJson = JSON.parse(responseAddReply.payload);
      const replyId = responseAddReplyJson.data.addedReply.id;

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'anda tidak dapat mengakses resource ini',
      );
    });

    it('should response 404 when the thread is not found', async () => {
      // Arrange
      const requestAddUser = {
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };

      const requestAddThreadPayload = {
        title: 'new thread',
        body: 'new thread body',
      };

      const requestAddCommentPayload = {
        content: 'new comment',
      };

      const requestAddReplyPayload = {
        content: 'new reply',
      };

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: requestAddUser.username,
          password: requestAddUser.password,
          fullname: requestAddUser.fullname,
        },
      });

      const responseAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: requestAddUser.username,
          password: requestAddUser.password,
        },
      });
      const responseAuthJson = JSON.parse(responseAuth.payload);
      const accessToken = responseAuthJson.data.accessToken;

      const responseAddThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestAddThreadPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseAddThreadJson = JSON.parse(responseAddThread.payload);
      const threadId = responseAddThreadJson.data.addedThread.id;

      const responseAddComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestAddCommentPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseAddCommentJson = JSON.parse(responseAddComment.payload);
      const commentId = responseAddCommentJson.data.addedComment.id;

      const responseAddReply = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestAddReplyPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseAddReplyJson = JSON.parse(responseAddReply.payload);
      const replyId = responseAddReplyJson.data.addedReply;

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('balasan tidak ditemukan');
    });
  });
});
