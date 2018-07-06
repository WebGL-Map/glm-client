import {GLM_CONFIG} from "glm-client-base";

/**
 * A class to holder helper functions for the GLM client.
 *
 * @author Tyler Bucher
 */
export default class Util {

    /**
     *
     * @param url
     * @returns {*}
     */
    static getIpAndPort(url) {
        let urlString = url;
        urlString     = urlString.slice(0, -1);
        urlString     = urlString.slice(GLM_CONFIG.wsProtocol.length + 3);
        return urlString.split(':')
    }
}