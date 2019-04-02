/**
 * 增强validate的邮箱正则
 */

export default email => {

    const emailRegex = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;

    if (!email) { return false; }
    if (false === emailRegex.test(email)) { return false; }

    return true;
};