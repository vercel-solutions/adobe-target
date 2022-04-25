import targetClient from '@adobe/target-nodejs-sdk';

// We save the client here to avoid creating it multiple times on
// calls to the same serverless function.
let _client: any;

export default async function getTargetClient() {
  if (_client) return _client;

  return new Promise((resolve, reject) => {
    const client = process.env.TARGET_CLIENT;
    const organizationId = process.env.TARGET_ORGANIZATION_ID;

    if (!client || !organizationId) {
      return reject(
        new Error('Missing env TARGET_CLIENT or TARGET_ORGANIZATION_ID')
      );
    }

    let artifactDownloaded = false;
    const config = {
      client,
      organizationId,
      decisioningMethod: 'on-device',
      // This is the SDK's default
      timeout: 3000,
      // Enables login
      // logger: console,
      events: {
        artifactDownloadSucceeded: onArtifactDownloadSucceeded,
        artifactDownloadFailed: onArtifactDownloadFailed,
        clientReady: targetClientReady,
      },
    };

    function targetClientReady() {
      if (!artifactDownloaded) {
        return reject(
          new Error(
            'The client is ready but no artifacts were loaded, this most likely means there are no published activities in Target.'
          )
        );
      }
      console.log('Client ready!');
      _client = target;
      resolve(_client);
    }
    /**
     * In the case that the artifact download succeeds or fails, the `event` object includes:
     *
     * `event.artifactLocation`: Location from where the Artifact is downloaded.
     * `event.artifactName`: Name of the Artifact.
     */
    function onArtifactDownloadSucceeded(event) {
      artifactDownloaded = true;
      // console.log('Artifact download succeeded:', event);
    }
    function onArtifactDownloadFailed(event) {
      console.error('Artifact download failed:', event);
    }

    // The client downloads the rule artifact, so we create it once for it
    // to use the memory cache of serverless functions.
    const target = targetClient.create(config);
  });
}
