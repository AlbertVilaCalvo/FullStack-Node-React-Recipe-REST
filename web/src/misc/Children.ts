import * as React from 'react'

/**
 * Instead of doing eg `MyText(props: TextProps & {children: React.ReactNode})`
 * you can do `MyText(props: RequiredChildren<TextProps>)`.
 */
export type RequiredChildren<Props> = Props & { children: React.ReactNode }

/**
 * Instead of doing eg `MyText(props: TextProps & {children?: React.ReactNode})`
 * you can do `MyText(props: OptionalChildren<TextProps>)`.
 */
export type OptionalChildren<Props> = Props & { children?: React.ReactNode }
