const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate the get thread detail action correctly', async () => {
    const mockThread = new DetailThread({
      id: 'thread-123',
      title: 'Title Thread',
      body: 'lorem ipsum',
      date: new Date(),
      username: 'dicoding',
    });

    const mockComments = [
      new DetailComment({
        id: 'comment-123',
        username: 'dicoding',
        content: 'lorem ipsum',
        date: new Date(),
        isDeleted: false,
      }),
    ];

    const mockReplies = [
      new DetailReply({
        id: 'reply-123',
        username: 'dicoding',
        date: new Date(),
        content: 'lorem ipsum',
        isDeleted: false,
      }),

      new DetailReply({
        id: 'reply-abc',
        username: 'dicoding',
        date: new Date(),
        content: 'lorem ipsum',
        isDeleted: false,
      }),
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockRepliesRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockRepliesRepository.getReplyById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    const usecase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockRepliesRepository,
    });

    const threadDetails = await usecase.execute('thread-123');

    const expectedThreadDetails = {
      id: 'thread-123',
      title: 'Title Thread',
      body: 'lorem ipsum',
      date: new Date(),
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: new Date(),
          content: 'lorem ipsum',
          replies: [
            {
              id: 'reply-123',
              username: 'dicoding',
              date: new Date(),
              content: 'lorem ipsum',
            },
            {
              id: 'reply-abc',
              username: 'dicoding',
              date: new Date(),
              content: 'lorem ipsum',
            },
          ],
        },
      ],
    };

    const comments = threadDetails.comments;
    const expectedComments = expectedThreadDetails.comments;

    const replies = comments[0].replies;
    const expectedReplies = expectedComments[0].replies;

    expect(threadDetails.id).toStrictEqual(expectedThreadDetails.id);
    expect(threadDetails.title).toStrictEqual(expectedThreadDetails.title);
    expect(threadDetails.body).toStrictEqual(expectedThreadDetails.body);
    expect(threadDetails.date.getDate()).toStrictEqual(
      expectedThreadDetails.date.getDate(),
    );
    expect(threadDetails.username).toStrictEqual(
      expectedThreadDetails.username,
    );

    expect(comments[0].id).toStrictEqual(expectedComments[0].id);
    expect(comments[0].username).toStrictEqual(expectedComments[0].username);
    expect(comments[0].date.getDate()).toStrictEqual(
      expectedComments[0].date.getDate(),
    );
    expect(comments[0].content).toStrictEqual(expectedComments[0].content);
    expect(replies[0].id).toStrictEqual(expectedReplies[0].id);
    expect(replies[0].username).toStrictEqual(expectedReplies[0].username);
    expect(replies[0].date.getDate()).toStrictEqual(
      expectedReplies[0].date.getDate(),
    );
    expect(replies[0].content).toStrictEqual(expectedReplies[0].content);
    expect(replies[1].id).toStrictEqual(expectedReplies[1].id);
    expect(replies[1].username).toStrictEqual(expectedReplies[1].username);
    expect(replies[1].date.getDate()).toStrictEqual(
      expectedReplies[1].date.getDate(),
    );
    expect(replies[1].content).toStrictEqual(expectedReplies[1].content);
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentById).toBeCalledWith('thread-123');
    expect(mockRepliesRepository.getReplyById).toBeCalledWith('comment-123');
  });
});
