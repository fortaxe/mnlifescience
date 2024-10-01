import jwt from 'jsonwebtoken';

const authMiddleware = (requiredRole) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send('Unauthorized: No token provided');
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // Save the decoded token payload for further use

            // Check if the user has the correct role
            if (decoded.role !== requiredRole) {
                return res.status(403).send('Forbidden: Insufficient permissions');
            }

            next(); // Token is valid, move to the next middleware
        } catch (error) {
            return res.status(401).send('Invalid token');
        }
    };
};

export default authMiddleware;