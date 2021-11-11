const LINEAR_GRADIENT_ID_REGEX = /"openingElement":{[^[\]{}]*"name":{[^[\]{}]*"linearGradient[^[\]{}]*}[^[\]{}]*"attributes":\[{[^[\]{}]*"name":{[^[\]{}]*id"}[^[\]{}]*"value":{[^[\]{}]*"value":"([^[\]{}]*)"[^[\]{}]*/g
const RADIAL_GRADIENT_ID_REGEX = /"openingElement":{[^[\]{}]*"name":{[^[\]{}]*"radialGradient[^[\]{}]*}[^[\]{}]*"attributes":\[{[^[\]{}]*"name":{[^[\]{}]*id"}[^[\]{}]*"value":{[^[\]{}]*"value":"([^[\]{}]*)"[^[\]{}]*/g

const BICOLOR_SVG_IMPORT = "import { svgIdentifier } from 'ui/svg/utils'"

const getSvgWithIdsBody = (numberOfIds) =>
  [...Array(numberOfIds).keys()]
    .map(
      (i) =>
        `const { id: gradientId${i == 0 ? '' : `${i + 1}`}, fill: gradientFill${
          i == 0 ? '' : `${i + 1}`
        } } = svgIdentifier()`
    )
    .join('\n')

function updateStringJSXForBicolorSvg(
  initStringJsx,
  linearGradientId,
  gradientId = 'gradientId',
  gradientFill = 'gradientFill'
) {
  let stringJsx = initStringJsx
  const oldFillElement = `{"type":"JSXAttribute","name":{"type":"JSXIdentifier","name":"fill"},"value":{"type":"StringLiteral","value":"url(#${linearGradientId})"}}`
  const newFillElement = `{"type":"JSXAttribute","name":{"type":"JSXIdentifier","name":"fill"},"value":{"type":"JSXExpressionContainer","expression":{"type":"Identifier","name":"${gradientFill}"}}}`
  stringJsx = stringJsx.replace(oldFillElement, newFillElement)
  const oldLinearGradientElement = `{"type":"JSXAttribute","name":{"type":"JSXIdentifier","name":"id"},"value":{"type":"StringLiteral","value":"${linearGradientId}"}}`
  const newLinearGradientElement = `{"type":"JSXAttribute","name":{"type":"JSXIdentifier","name":"id"},"value":{"type":"JSXExpressionContainer","expression":{"type":"Identifier","name":"${gradientId}"}}}`
  return stringJsx.replace(oldLinearGradientElement, newLinearGradientElement)
}

function template({ template }, opts, { imports, componentName, jsx: initJsx }) {
  const plugins = ['jsx', 'typescript']
  const typeScriptTpl = template.smart({ plugins, retainLines: true, compact: false })

  let jsx = initJsx
  let stringJsx = JSON.stringify(jsx)
  const linearGradientRegexMatch = [...stringJsx.matchAll(LINEAR_GRADIENT_ID_REGEX)]
  const radialGradientRegexMatch = [...stringJsx.matchAll(RADIAL_GRADIENT_ID_REGEX)]
  const ids = {
    linearGradients: linearGradientRegexMatch.map((match) => match[1]),
    radialGradients: radialGradientRegexMatch.map((match) => match[1]),
  }
  const numberOfIds = [ids.linearGradients, ids.radialGradients].reduce(
    (sum, matches) => sum + (matches ? matches.length : 0),
    0
  )
  const isBicolor = numberOfIds > 0

  ids.linearGradients.forEach((id, i) => {
    console.warn('linearGradients.forEach', id, i)
    const gradientId = `gradientId${i == 0 ? '' : `${i + 1}`}`
    const gradientFill = `gradientFill${i == 0 ? '' : `${i + 1}`}`
    stringJsx = updateStringJSXForBicolorSvg(stringJsx, id, gradientId, gradientFill)
  })
  ids.radialGradients.forEach((id, index) => {
    console.warn('radialGradients.forEach', id, index)
    const i = ids.linearGradients.length + index
    const gradientId = `gradientId${i == 0 ? '' : `${i + 1}`}`
    const gradientFill = `gradientFill${i == 0 ? '' : `${i + 1}`}`
    stringJsx = updateStringJSXForBicolorSvg(stringJsx, id, gradientId, gradientFill)
  })
  if (isBicolor) jsx = JSON.parse(stringJsx)

  return typeScriptTpl.ast`${imports}
  ${'\n'}
  ${isBicolor ? BICOLOR_SVG_IMPORT : ''}
  import { ColorsEnum } from 'ui/theme'
  ${'\n'}
  import { IconInterface } from './types'
  ${'\n'}
  export const ${componentName} = ({
    size = 32,
    color = ColorsEnum.BLACK,
    testID,
  }: IconInterface) => {
    ${isBicolor ? getSvgWithIdsBody(numberOfIds) : ''}
  return ${jsx}
}`
}

module.exports = template
