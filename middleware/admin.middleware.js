export const checkAdmin = (req, res, next) => {
    res.status(200).json({ message: "Admin access granted (middleware placeholder)" });
//   const isAdmin = req.headers["x-admin-token"] === "secureadmintoken123";
//   if (!isAdmin) {
//     return res.status(403).json({ message: "Access denied. Admins only." });
//   }
    next();
};