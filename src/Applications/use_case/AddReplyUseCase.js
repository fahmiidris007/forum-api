const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, commentId, payload, owner) {
    const newReply = new AddReply(payload);

    await this._threadRepository.verifyAvailableThread(threadId);

    await this._commentRepository.verifyAvailableComment(commentId, threadId);

    return this._replyRepository.addReply(commentId, newReply, owner);
  }
}

module.exports = AddReplyUseCase;
