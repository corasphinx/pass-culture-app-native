#! /bin/bash
set -e

docker run --rm -v ${PWD}:/local swaggerapi/swagger-codegen-cli-v3 generate \
        -i https://pass-culture-api-dev.osc-fr1.scalingo.io/native/v1/openapi.json `# schema location` \
        -l typescript-fetch `# client type` \
        -c /local/swagger_codegen/swagger_codegen_config.json `# swagger codegen config` \
        -t /local/swagger_codegen/gen_templates `# templates directory` \
        -o /local/src/api/gen `# output directory`

success() {
  echo -e "✅  ${GREEN}$1${NO_COLOR}"
}

success "TypeScript API client and interfaces were generated successfully."
