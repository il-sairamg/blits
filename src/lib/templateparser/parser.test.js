/*
 * Copyright 2023 Comcast Cable Communications Management, LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'tape'
import parser from './parser.js'

test('Type', (assert) => {
  const expected = 'function'
  const actual = typeof parser

  assert.equal(actual, expected, 'Parser should be a function')
  assert.end()
})

test('Returns an object', (assert) => {
  const result = parser()
  const expected = 'object'
  const actual = typeof result

  assert.equal(actual, expected, 'Parser should return an object')
  assert.ok('children' in result, 'Parser should return an object with a children key')
  assert.ok(Array.isArray(result.children), 'Children key returned by parser should be an array')
  assert.end()
})

test('Parse simple single tag', (assert) => {
  const template = '<Component></Component>'

  const expected = {
    children: [
      {
        type: 'Component',
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse simple tag and simple nested tag', (assert) => {
  const template = '<Component><Element></Element></Component>'

  const expected = {
    children: [
      {
        type: 'Component',
        children: [
          {
            type: 'Element',
          },
        ],
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse simple single tag with static attributes', (assert) => {
  const template = '<Component x="10" y="20"></Component>'

  const expected = {
    children: [
      {
        type: 'Component',
        x: '10',
        y: '20',
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse tag with attributes and nested tag with attributes', (assert) => {
  const template = '<Component x="10" y="20"><Element w="100" h="300"></Element></Component>'

  const expected = {
    children: [
      {
        type: 'Component',
        x: '10',
        y: '20',
        children: [
          {
            type: 'Element',
            w: '100',
            h: '300',
          },
        ],
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse tag with attributes and 2 nested tags with attributes', (assert) => {
  const template = `
    <Component x="10" y="20">
      <Element w="100" h="300" x="0"></Element>
      <Element w="100" h="300" x="50"></Element>
    </Component>`

  const expected = {
    children: [
      {
        type: 'Component',
        x: '10',
        y: '20',
        children: [
          {
            type: 'Element',
            w: '100',
            h: '300',
            x: '0',
          },
          {
            type: 'Element',
            w: '100',
            h: '300',
            x: '50',
          },
        ],
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse tag with attributes and deep nested tag with attributes', (assert) => {
  const template = `
    <Component x="10" y="20">
      <Element w="100" h="300" x="0"></Element>
      <Element w="100" h="300" x="50">
        <Button label="Hello"></Button>
        <Button label="World"></Button>
      </Element>
    </Component>`

  const expected = {
    children: [
      {
        type: 'Component',
        x: '10',
        y: '20',
        children: [
          {
            type: 'Element',
            w: '100',
            h: '300',
            x: '0',
          },
          {
            type: 'Element',
            w: '100',
            h: '300',
            x: '50',
            children: [
              {
                type: 'Button',
                label: 'Hello',
              },
              {
                type: 'Button',
                label: 'World',
              },
            ],
          },
        ],
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse simple single tag with dynamic attributes', (assert) => {
  const template = '<Component x="$x" y="$y"></Component>'

  const expected = {
    children: [
      {
        type: 'Component',
        x: '$x',
        y: '$y',
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse tag with attributes and reactive attributes', (assert) => {
  const template = '<Component x="10" y="20" :w="foo" :h="test" test="ok"></Component>'

  const expected = {
    children: [
      {
        type: 'Component',
        x: '10',
        y: '20',
        ':w': 'foo',
        ':h': 'test',
        test: 'ok',
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test("Parse simple single tag where one of the attributes has a dash in it's name", (assert) => {
  const template = '<Component x="10" y="20" my-Attribute="this"></Component>'

  const expected = {
    children: [
      {
        type: 'Component',
        'my-Attribute': 'this',
        x: '10',
        y: '20',
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse nested self closing tag', (assert) => {
  const template = '<Component><Input /></Component>'

  const expected = {
    children: [
      {
        type: 'Component',
        children: [
          {
            type: 'Input',
          },
        ],
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse multiple nested self closing tags', (assert) => {
  const template = '<Component><Input /><Input /><Input /></Component>'

  const expected = {
    children: [
      {
        type: 'Component',
        children: [
          {
            type: 'Input',
          },
          {
            type: 'Input',
          },
          {
            type: 'Input',
          },
        ],
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse attributes which values have spaces in it', (assert) => {
  const template = '<Component attribute="I have spaces"></Component>'

  const expected = {
    children: [
      {
        type: 'Component',
        attribute: 'I have spaces',
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse attributes with an expression in it', (assert) => {
  const template = `
    <Component
      :attribute1="$foo * 2"
      :attribute2="$ok ? 'Yes' : 'No'"
      :attribute3="$text.split('').reverse().join('')"
      :attribute4="$size > 100 ? 110 : $size"
      :attribute5="Math.min($size, 100)"
    />`

  const expected = {
    children: [
      {
        type: 'Component',
        ':attribute1': '$foo * 2',
        ':attribute2': "$ok ? 'Yes' : 'No'",
        ':attribute3': "$text.split('').reverse().join('')",
        ':attribute4': '$size > 100 ? 110 : $size',
        ':attribute5': 'Math.min($size, 100)',
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse template with commented tag (and skip it)', (assert) => {
  const template = `
    <Component x="10" y="20">
      <!--Element w="100" h="300" x="0"></Element-->
      <Element w="100" h="300" x="50">
        <Button label="Hello"></Button>
        <!--Button label="World"></Button-->
      </Element>
    </Component>`

  const expected = {
    children: [
      {
        type: 'Component',
        x: '10',
        y: '20',
        children: [
          {
            type: 'Element',
            w: '100',
            h: '300',
            x: '50',
            children: [
              {
                type: 'Button',
                label: 'Hello',
              },
            ],
          },
        ],
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse template with comment spanned across multiple tags (and skip it)', (assert) => {
  const template = `
    <Component x="10" y="20">
      <!--Element w="100" h="300" x="0"></Element-->
      <Element w="100" h="300" x="50">
        <!--Button label="Hello"></Button>
        <Button label="World"></Button-->
      </Element>
    </Component>`

  const expected = {
    children: [
      {
        type: 'Component',
        x: '10',
        y: '20',
        children: [
          {
            type: 'Element',
            w: '100',
            h: '300',
            x: '50',
          },
        ],
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse template with enclosing comment (and skip it)', (assert) => {
  const template = `
    <Component x="10" y="20">
      <Element w="100" h="300" x="0"></Element>
      <Element w="100" h="300" x="50">
        <!--
          <Button label="Hello"></Button>
          <Button label="World"></Button>
        -->
      </Element>
    </Component>`

  const expected = {
    children: [
      {
        type: 'Component',
        x: '10',
        y: '20',
        children: [
          {
            type: 'Element',
            w: '100',
            h: '300',
            x: '0',
          },
          {
            type: 'Element',
            w: '100',
            h: '300',
            x: '50',
          },
        ],
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse template with for loop', (assert) => {
  const template = `
    <List>
      <ListItem :for="item in $items" />
    </List>`

  const expected = {
    children: [
      {
        type: 'List',
        children: [
          {
            type: 'ListItem',
            ':for': 'item in $items',
          },
        ],
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse template with a conditional (if-statement)', (assert) => {
  const template = `
    <Component :if="$loggedIn === true">
      <Text value="Welcome" />
      <Avatar :user="$user" />
    </Component>`

  const expected = {
    children: [
      {
        type: 'Component',
        ':if': '$loggedIn === true',
        children: [
          {
            type: 'Text',
            value: 'Welcome',
          },
          {
            type: 'Avatar',
            ':user': '$user',
          },
        ],
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse template with a visibility toggle (show-statement)', (assert) => {
  const template = `
    <Poster w="200" h="500">
      <Label :text="$text" />
      <Image src="$image" />
      <Star :show="$favorited === true" />
    </Poster>`

  const expected = {
    children: [
      {
        type: 'Poster',
        w: '200',
        h: '500',
        children: [
          {
            type: 'Label',
            ':text': '$text',
          },
          {
            type: 'Image',
            src: '$image',
          },
          {
            type: 'Star',
            ':show': '$favorited === true',
          },
        ],
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse template with a nameless tag', (assert) => {
  const template = `
    <>
      <Component x="50" y="20">
        <Component w="100" h="20" />
      </Component>
    </>`

  const expected = {
    children: [
      {
        type: null,
        children: [
          {
            type: 'Component',
            x: '50',
            y: '20',
            children: [
              {
                type: 'Component',
                w: '100',
                h: '20',
              },
            ],
          },
        ],
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse template with a transition argument (single value)', (assert) => {
  const template = `
    <Element x.transition="$offset" y="200">
    </Element>`

  const expected = {
    children: [
      {
        type: 'Element',
        x: '{transition: $offset}',
        y: '200',
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse template with a transition argument (object)', (assert) => {
  const template = `
    <Element :x.transition="{v: $offset, d: 2000}" y="200">
    </Element>`

  const expected = {
    children: [
      {
        type: 'Element',
        ':x': '{transition: {v: $offset, d: 2000}}',
        y: '200',
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse template with a different modifier', (assert) => {
  const template = `
    <Element x.modifier="ok" y="200">
    </Element>`

  const expected = {
    children: [
      {
        type: 'Element',
        x: '{modifier: ok}',
        y: '200',
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse template with a full transition object (without the transition modifier)', (assert) => {
  const template = `
    <Element :x="{transition: {v: $offset, d: 2000, p: 100}}" y="200">
    </Element>`

  const expected = {
    children: [
      {
        type: 'Element',
        ':x': '{transition: {v: $offset, d: 2000, p: 100}}',
        y: '200',
      },
    ],
  }
  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse template with attributes with values spread over multiple lines', (assert) => {
  const template = `
  <Component>
    <Element
      w="160" h="160" x="40" y="40" color="#fb923c"
      :effects="[$shader(
        'radius',
        {radius: 44}
      )]"
    />
    <Element
      w="120" h="120"
      x="100" y="100"
      :effects="[
        $shader(
          'radius',
          {
            radius: 45
          }
        )
      ]"
    />
  </Component>`

  const expected = {
    children: [
      {
        type: 'Component',
        children: [
          {
            type: 'Element',
            w: '160',
            h: '160',
            x: '40',
            y: '40',
            color: '#fb923c',
            ':effects': "[$shader( 'radius', {radius: 44} )]",
          },
          {
            type: 'Element',
            w: '120',
            h: '120',
            x: '100',
            y: '100',
            ':effects': "[ $shader( 'radius', { radius: 45 } ) ]",
          },
        ],
      },
    ],
  }

  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse template with inline text between tags', (assert) => {
  const template = `
  <Component>
    <Element w="160" h="160" x="40" y="40" color="#fb923c">Lorem ipsum</Element>
  </Component>`

  const expected = {
    children: [
      {
        type: 'Component',
        children: [
          {
            type: 'Element',
            w: '160',
            h: '160',
            x: '40',
            y: '40',
            color: '#fb923c',
            content: 'Lorem ipsum',
          },
        ],
      },
    ],
  }

  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse template with multiple inline texts between different tags', (assert) => {
  const template = `
  <Component>
    <Element w="160" h="160" x="40" y="40" color="#fb923c">Lorem ipsum</Element>
    <Element>dolor sit amet</Element>
    <Element>
      <Text>consectetur adipiscing elit</Text>
      <Element>
        <Text>sed do eiusmod tempor</Text>
      </Element>
    </Element>

  </Component>`

  const expected = {
    children: [
      {
        type: 'Component',
        children: [
          {
            type: 'Element',
            w: '160',
            h: '160',
            x: '40',
            y: '40',
            color: '#fb923c',
            content: 'Lorem ipsum',
          },
          {
            type: 'Element',
            content: 'dolor sit amet',
          },
          {
            type: 'Element',
            children: [
              {
                type: 'Text',
                content: 'consectetur adipiscing elit',
              },
              {
                type: 'Element',
                children: [
                  {
                    type: 'Text',
                    content: 'sed do eiusmod tempor',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }

  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse template with attribute name starts with @ character', (assert) => {
  const template = `
  <Component>
    <Element w="160" h="160" x="40" y="40" color="#fb923c" @loaded="@loaded" />
  </Component>`

  const expected = {
    children: [
      {
        type: 'Component',
        children: [
          {
            type: 'Element',
            w: '160',
            h: '160',
            x: '40',
            y: '40',
            color: '#fb923c',
            '@loaded': '@loaded',
          },
        ],
      },
    ],
  }

  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse template with attribute values with delimited either single or double quotes', (assert) => {
  const template = `
  <Component>
    <Element
      w='160' h="160" x='40' y='40' color="#fb923c"
      :effects='[$shader(
        "radius",
        {radius: 44}
      )]'
    />
    <Element
      w='120' h="120"
      x='100' y="100"
      :effects="[
        $shader(
          'radius',
          {
            radius: 45
          }
        )
      ]"
    />
  </Component>`

  const expected = {
    children: [
      {
        type: 'Component',
        children: [
          {
            type: 'Element',
            w: '160',
            h: '160',
            x: '40',
            y: '40',
            color: '#fb923c',
            ':effects': '[$shader( "radius", {radius: 44} )]',
          },
          {
            type: 'Element',
            w: '120',
            h: '120',
            x: '100',
            y: '100',
            ':effects': "[ $shader( 'radius', { radius: 45 } ) ]",
          },
        ],
      },
    ],
  }

  const actual = parser(template)

  assert.deepEqual(actual, expected, 'Parser should return object representation of template')
  assert.end()
})

test('Parse template with multiple top level elements and parsing should fail', (assert) => {
  const template = `
  <Component>
    <Element
      w='160' h="160" x='40' y='40' color="#fb923c"
      :effects='[$shader(
        "radius",
        {radius: 44}
      )]'
    />
  </Component>
  <Component>
    <Element
      w='120' h="120"
      x='100' y="100"
      :effects="[
        $shader(
          'radius',
          {
            radius: 45
          }
        )
      ]"
    />
  </Component>`

  try {
    parser(template)
    assert.fail('Parser should throw TemplateStructureError:MultipleTopLevelTags')
  } catch (error) {
    assert.equal(error.name, 'TemplateStructureError', 'Parser should throw TemplateStructureError')
    assert.ok(
      error.message.startsWith('MultipleTopLevelTags'),
      'Parser should throw TemplateStructureError:MultipleTopLevelTags'
    )
  }

  assert.end()
})

test('Parse template with unclosed tag and parsing should fail', (assert) => {
  const template = `
  <Component>
    <Element>
  </Component>
  `

  try {
    parser(template)
    assert.fail('Parser should throw TemplateStructureError:MismatchedClosingTag')
  } catch (error) {
    assert.equal(error.name, 'TemplateStructureError', 'Parser should throw TemplateStructureError')
    assert.ok(
      error.message.startsWith('MismatchedClosingTag'),
      'Parser should throw TemplateStructureError:MismatchedClosingTag'
    )
  }
  assert.end()
})

test('Parse template with multiple unclosed tags and parsing should fail', (assert) => {
  const template = `
  <Component>
    <Element>
      <Button />
      <Text>Lorem Ipsum</Text>
      <Element>
        <Button />
        <Text>Lorem Ipsum</Text>
  </Component>
  `

  try {
    parser(template)
    assert.fail('Parser should throw TemplateStructureError:MismatchedClosingTag')
  } catch (error) {
    assert.equal(error.name, 'TemplateStructureError', 'Parser should throw TemplateStructureError')
    assert.ok(
      error.message.startsWith('MismatchedClosingTag'),
      'Parser should throw TemplateStructureError:MismatchedClosingTag'
    )
  }
  assert.end()
})

test('Parse template with an invalid closing tag and parsing should fail', (assert) => {
  const template = `
  <Component>
    <Element>
    </Element/>
  </Component>
  `

  try {
    parser(template)
    assert.fail('Parser should throw TemplateParseError:InvalidClosingTag')
  } catch (error) {
    assert.equal(error.name, 'TemplateParseError', 'Parser should throw TemplateParseError')
    assert.ok(
      error.message.startsWith('InvalidClosingTag'),
      'Parser should throw TemplateParseError:InvalidClosingTag'
    )
  }

  assert.end()
})

test('Parse template with multiple self-closing tags at the top level and parsing should fail', (assert) => {
  const template = `
  <Component/>
  <Element/>
  `

  try {
    parser(template)
    assert.fail('Parser should throw TemplateStructureError:MultipleTopLevelTags')
  } catch (error) {
    assert.equal(error.name, 'TemplateStructureError', 'Parser should throw TemplateStructureError')
    assert.ok(
      error.message.startsWith('MultipleTopLevelTags'),
      'Parser should throw TemplateStructureError:MultipleTopLevelTags'
    )
  }

  assert.end()
})

test('Parse template with a closing tag at the beginning and parsing should fail', (assert) => {
  const template = `
  </Element>
  <Component>
    <Element/>
  </Component>
  `

  try {
    parser(template)
    assert.fail('Parser should throw TemplateStructureError:MismatchedClosingTag')
  } catch (error) {
    assert.equal(error.name, 'TemplateStructureError', 'Parser should throw TemplateStructureError')
    assert.ok(
      error.message.startsWith('MismatchedClosingTag'),
      'Parser should throw TemplateStructureError:MismatchedClosingTag'
    )
  }

  assert.end()
})

test('Parse template with a closing tag that has attributes and parsing should fail', (assert) => {
  const template = `
  <Component>
    <Text>Lorem ipsum dolor sit amet</Text>
    <Element></Element x="200">
  </Component>
  `

  try {
    parser(template)
    assert.fail('Parser should throw TemplateParseError:AttributesInClosingTag')
  } catch (error) {
    assert.equal(error.name, 'TemplateParseError', 'Parser should throw TemplateParseError')
    assert.ok(
      error.message.startsWith('AttributesInClosingTag'),
      'Parser should throw TemplateParseError:AttributesInClosingTag'
    )
  }

  assert.end()
})
