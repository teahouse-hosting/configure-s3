const core = require('@actions/core')
const github = require('@actions/github')
const http_client = require('@actions/http-client')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    // The `domain` input is defined in action metadata file
    const domain = core.getInput('domain', { required: true })
    const server = core.getInput('server') || 'https://admin.teahouse.cafe'
    core.debug('Getting OIDC token')
    const oidc_token = await core.getIDToken()

    core.info(`Configuring upload for ${domain}`)
    const http = new http_client.HttpClient()
    const resp = await http.postJson(`${server}/upload/get-s3-config`, {
      token: oidc_token,
      domain
    })
    if (resp.statusCode != 200) {
      core.setFailed(`Got an HTTP ${resp.statusCode} from Teahouse`)
    }
    const envvars = resp.result

    if (envvars.AWS_ACCESS_KEY_ID) {
      core.exportVariable('AWS_ACCESS_KEY_ID', envvars.AWS_ACCESS_KEY_ID)
    }
    if (envvars.AWS_ENDPOINT_URL_S3) {
      core.exportVariable('AWS_ENDPOINT_URL_S3', envvars.AWS_ENDPOINT_URL_S3)
    }
    if (envvars.AWS_REGION) {
      core.exportVariable('AWS_REGION', envvars.AWS_REGION)
    }
    if (envvars.AWS_SECRET_ACCESS_KEY) {
      core.setSecret(envvars.AWS_SECRET_ACCESS_KEY)
      core.exportVariable(
        'AWS_SECRET_ACCESS_KEY',
        envvars.AWS_SECRET_ACCESS_KEY
      )
    }
    if (envvars.AWS_SESSION_TOKEN) {
      core.exportVariable('AWS_SESSION_TOKEN', envvars.AWS_SESSION_TOKEN)
    }
    if (envvars.BUCKET_NAME) {
      core.setOutput('bucket', envvars.BUCKET_NAME)
    }
  } catch (error) {
    // Fail the workflow step if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
