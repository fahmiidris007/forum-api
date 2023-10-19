class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);
    const { id, username, content, date, isDeleted } = payload;
    this.id = id;
    this.username = username;
    this.content = isDeleted ? '**komentar telah dihapus**' : content;
    this.date = date;
    this.isDeleted = isDeleted;
  }

  _verifyPayload({ id, username, content, date, isDeleted }) {
    if (!id || !username || !content || !date || isDeleted === 'undefined') {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (
      typeof id !== 'string' ||
      typeof username !== 'string' ||
      typeof content !== 'string' ||
      !(date instanceof Date) ||
      typeof isDeleted !== 'boolean'
    ) {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}
module.exports = DetailComment;
