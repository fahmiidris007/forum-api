class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const threads = await this._threadRepository.getThreadById(threadId);
    const comment = await this._commentRepository.getCommentById(threadId);

    const comments = await Promise.all(
      comment.map(async (value) => {
        const replies = await this._replyRepository.getReplyById(value.id);

        return { ...value, replies };
      }),
    );

    return { ...threads, comments };
  }
}

module.exports = GetThreadUseCase;
