class DeleteReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(useCaseDeletePayload) {
    const { replyId, owner } = useCaseDeletePayload;

    await this._replyRepository.verifyAvailableReply(replyId);

    await this._replyRepository.verifyReplyAccess(replyId, owner);

    return this._replyRepository.deleteReplyById(replyId);
  }
}

module.exports = DeleteReplyUseCase;
