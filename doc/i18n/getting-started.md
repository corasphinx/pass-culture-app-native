## How to translate

It's easy as follows:

```tsx
import { Text, View } from 'react-native'
import { t } from '@lingui/macro'

function HelloWorld({ name: string }) {
  return <View><Text>{t(`Hello ${name}`)}</Text></View>
}
```

For plural, you can use:

```tsx
import { Text } from 'react-native'
import { plural } from '@lingui/macro'

function ShowResultsText({ countr: number }) {
  return (
    <Text>
      {plural(count, {
        one: 'Afficher # résultat',
        other: 'Afficher les # résultats',
      })}
    </Text>
  )
}
```

## v3 migration note

V3 brings the `plural` into our application, but it also brings two new non blocking bugs :

1. Test unit doesn't exist properly : https://github.com/lingui/js-lingui/issues/1041
2. Translation may be empty in `development` and show a warning : https://github.com/lingui/js-lingui/issues/1042

*(2)* can be problematic while in development, 
this happens because the variable to interpolate is returning a `function` instead of a `string`.
It can easily be fixed by calling `.toString()` on the variable. 

> Don't forget to remove every `.toString()` as they are not required in `production` builds 
> and that bug should be fixed in a futur release of Lingui v3.

### v2 to v3 syntax changes

V2 syntax:

```jsx
_(t(`text`)) 
```

V3 use macro, you don't need `_` anymore:

```jsx
t(`text`)
```

**Unicode chars are trimmed**

Left and right of your translation is trimmed in v3, it is not possible to write:

```jsx
t`\u00a0EAN\u00a0`
```

Instead, use:

```jsx
'\u00a0' + t`EAN` + '\u00a0'
```

This works as it is not a suffix or prefix :

```jsx
t`Confirme ton e\u2011mail`
```

You don't need to add date formatting in the translation, do not write:

```jsx
t`À retirer avant le\u00a0${formatToCompleteFrenchDate(expirationDatetime, false)}`
```

Instead, write the translation and concatenate the non translated text : 

```jsx
t`À retirer avant le` + `\u00a0${formatToCompleteFrenchDate(expirationDatetime, false)}`
```