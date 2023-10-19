const DetailReply = require('../DetailReply');

describe('an DetailReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {};
    expect(() => new DetailReply(payload)).toThrowError(
      'DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: [],
      username: 2132,
      content: 2311,
      date: '2025',
    };

    expect(() => new DetailReply(payload)).toThrowError(
      'DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION',
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
    const detailReply = new DetailReply(payload);

    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.username).toEqual(payload.username);
    expect(detailReply.content).toEqual(payload.content);
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.isDeleted).toEqual(payload.isDeleted);
  });

  it('should create detailReply object correctly when isDeleted is true', () => {
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      content: 'lorem ipsum',
      date: new Date(),
      isDeleted: true,
    };
    const detailReply = new DetailReply(payload);

    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.username).toEqual(payload.username);
    expect(detailReply.content).toEqual('**balasan telah dihapus**');
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.isDeleted).toEqual(payload.isDeleted);
  });
});
