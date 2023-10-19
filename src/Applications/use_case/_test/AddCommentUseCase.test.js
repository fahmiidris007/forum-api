const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddComments = require('../../../Domains/comments/entities/AddComment');
const AddedComments = require('../../../Domains/comments/entities/AddedComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const useCasePayload = {
      content: 'lorem ipsum',
    };
    const mockAddedComment = new AddedComments({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: 'user-123',
    });

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockCommentRepository.addComment = jest.fn().mockImplementation(() =>
      Promise.resolve(
        new AddedComments({
          id: 'comment-123',
          content: 'lorem ipsum',
          owner: 'user-123',
        }),
      ),
    );
    mockThreadRepository.verifyAvailableThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(
      'thread-123',
      useCasePayload,
      'user-123',
    );

    expect(addedComment).toStrictEqual(mockAddedComment);
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(
      'thread-123',
    );
    expect(mockCommentRepository.addComment).toBeCalledWith(
      'thread-123',
      new AddComments(useCasePayload),
      'user-123',
    );
  });
});
