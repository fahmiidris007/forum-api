class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, owner } = useCasePayload;
    await this._commentRepository.verifyAvailableComment(commentId, threadId);
    await this._commentRepository.verifyCommentAccess(commentId, owner);
    await this._commentRepository.deleteCommentById(commentId);
  }
}
module.exports = DeleteCommentUseCase;
