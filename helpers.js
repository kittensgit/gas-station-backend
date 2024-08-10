import jwt from 'jsonwebtoken';

export const createToken = (id) => {
    const token = jwt.sign(
        {
            _id: id,
        },
        'secret123',
        {
            expiresIn: '35d',
        }
    );
    return token;
};
