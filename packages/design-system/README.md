# Next Design System

A wrapping package for the [OGCIO design system](https://storybook.design-system.ogcio.gov.ie/?path=/story/docs-get-started--page), using only the sass from the original repo.

Goal is to provide the css and progressive enhancement ready react components.

## Usage

All sass are bundled into a css file which you import (at the moment) at some global level by
`import "design-system/dist/style.css";`

Icons are available as a react component called `Icon`. The css has to be imported separately by
`import "design-system/dist/esm/index.css"`

Use class names from storybook unless a react component exists.

## Note
This is very much work in progress and is certainly subject to rapid and breaking changes.