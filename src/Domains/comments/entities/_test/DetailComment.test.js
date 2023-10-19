const DetailComments = require('../DetailComment');

describe('an DetailComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {};
    expect(() => new DetailComments(payload)).toThrowError(
      'DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: [],
      username: 2132,
      content: 2311,
      date: '2025',
      isDeleted: 'dadada',
    };

    expect(() => new DetailComments(payload)).toThrowError(
      'DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create detailComment object correctly', () => {
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      content: 'lorem ipsum',
      date: new Date(),
      isDeleted: false,
    };
    const detailComment = new DetailComments(payload);

    expect(detailComment).toBeInstanceOf(DetailComments);
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.content).toEqual(payload.content);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.isDeleted).toEqual(payload.isDeleted);
  });

  it('should create detailComment object correctly when isDeleted is true', () => {
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      content: 'lorem ipsum',
      date: new Date(),
      isDeleted: true,
    };

    const detailComment = new DetailComments(payload);

    expect(detailComment).toBeInstanceOf(DetailComments);
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.content).toEqual('**komentar telah dihapus**');
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.isDeleted).toEqual(payload.isDeleted);
  });
});
