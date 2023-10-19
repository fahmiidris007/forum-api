const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, payload, owner) {
    await this._threadRepository.verifyAvailableThread(threadId);
    const newComment = new AddComment(payload);
    return this._commentRepository.addComment(threadId, newComment, owner);
  }
}
module.exports = AddCommentUseCase;
