# Changelog

## 2.4.2

- Bump deps by @acro5piano

## 2.4.1

- Bump deps by @acro5piano

## 2.4.0

- Allow render a single fragment by @kevinsimper

## 2.3.0

- Array enum support by @acro5piano
- Make enum to accept both `ValueOf<T>` and `keyof T` by @acro5piano

## 2.2.3

- Fix vulnerability, and typing by @acro5piano

## 2.2.2

- Use `ValueOf<T>` instead of `keyof T` in types.enum by @acro5piano

## 2.2.1

- Fix rollup config: exluding 'tslib' by @acro5piano

## 2.2.0

- union fragment support by @luvies

## 2.1.1

- Fix function export by @acro5piano

## 2.1.0

**Features**

- Fragment support by @luvies

**Breaking changes**

- `query`, `mutation`, `subscription` are now top-level export by @acro5piano
- Replace `__params` with `params` helper by @luvies

For more detail, please see https://github.com/acro5piano/typed-graphqlify/pull/54

## 2.0.11-alpha

- Add rawString helper function by @Zzzen

## 2.0.10-alpha

- Refactor rendering GraphQL
- Fix #41

All by @luvies

## 2.0.9-alpha

- fix Using a scalar in an array outputs incorrect GraphQL @acro5piano and @luvies

## 2.0.8-alpha

- Bugfix: Nested fragment objects by @luvies

## 2.0.7-alpha

- Add npmignore files by @acro5piano

## 2.0.6-alpha

- Add custom scalar property by @luvies and @acro5piano

## 2.0.5-alpha

- Support inline fragment by @acro5piano

## 2.0.4-alpha

- Support for nested params added by @mlegenhausen

## 2.0.3-alpha

- Add type inference to query alias by @acro5piano

## 2.0.2-alpha

- add alias feature by @YardWill

## 2.0.1-alpha

- Delete type helper and fix readme by @acro5piano

## 2.0.0-alpha

- Split the code and Overload the query function by @YardWill

## 1.0.1

- Adds a proper ES6 entry point by Jiri Spac @capaj
- Removed superfluous TS strict options by @arjunyel

## 1.0.0

- Instead of passing the type of the graphql operation as first parameter typed-graphqlify now has methods on the `graphqlify` exported object by Jiri Spac @capaj

## 0.2.0

- First stable release by Kazuya Gosho @acro5piano
