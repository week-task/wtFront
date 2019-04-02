/**
 * 增强validate的正则
 */

export default tel => {

    const mobile = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;

    if (!tel) { return false; }
    if (false === mobile.test(tel)) { return false; }

    return true;
};