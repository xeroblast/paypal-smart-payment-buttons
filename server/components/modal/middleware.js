/* @flow */

import { clientErrorResponse, htmlResponse, allowFrame, defaultLogger, safeJSON, sdkMiddleware, type ExpressMiddleware } from '../../lib';
import type { LoggerType, CacheType } from '../../types';
import { getSelectedFunding } from '../../service';

import { EVENT } from './constants';
import { getParams } from './params';
import { getSmartModalClientScript } from './script';

type ModalMiddlewareOptions = {|
    logger? : LoggerType,
    cache? : CacheType,
    getAccessToken : Function,
    getSecurityContext : Function,
    serviceRequest : Function
|};

export function getModalMiddleware({ logger = defaultLogger, cache, getAccessToken, getSecurityContext, serviceRequest } : ModalMiddlewareOptions = {}) : ExpressMiddleware {
    return sdkMiddleware({ logger, cache }, async ({ req, res, params, meta, logBuffer }) => {
        logger.info(req, EVENT.RENDER);
        if (logBuffer) {
            logBuffer.flush(req);
        }

        const { clientID, orderID, customerID, cspNonce, debug } = getParams(params, req, res);
        
        const client = await getSmartModalClientScript({ debug, logBuffer, cache });

        logger.info(req, `modal_client_version_${ client.version }`);
        logger.info(req, `modal_params`, { params: JSON.stringify(params) });

        if (!clientID) {
            return clientErrorResponse(res, 'Please provide a clientID query parameter');
        }

        const facilitatorAccessTokenPromise = getAccessToken(req, clientID, { customerID });
        const facilitatorSecurityContextPromise = facilitatorAccessTokenPromise.then(accessToken => getSecurityContext(req, accessToken));
        const selectedFundingPromise = facilitatorSecurityContextPromise.then(securityContext => getSelectedFunding(req, serviceRequest, orderID, { securityContext }));

        const facilitatorAccessToken = await facilitatorAccessTokenPromise;
        const selectedFunding = await selectedFundingPromise;

        const pageHTML = `
            <!DOCTYPE html>
            <head>
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body data-nonce="${ cspNonce }" data-client-version="${ client.version }">
                ${ meta.getSDKLoader({ nonce: cspNonce }) }
                <script nonce="${ cspNonce }">${ client.script }</script>
                <script nonce="${ cspNonce }">spb.setupModal(${ safeJSON({ cspNonce, orderID, facilitatorAccessToken, selectedFunding }) })</script>
            </body>
        `;

        allowFrame(res);
        return htmlResponse(res, pageHTML);
    });
}
