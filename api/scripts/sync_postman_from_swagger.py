#!/usr/bin/env python3
"""
Sync Postman collection example responses from docs/swagger.json when possible.

This script attempts to match Postman items by path+method to swagger paths and
copy a 200 response example (if present) or generate a simple example from the
response schema $ref definitions.

Run:
  python scripts/sync_postman_from_swagger.py

This script is intentionally conservative: it updates examples only when it can
build a reasonable JSON sample. Review changes before commit.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SWAGGER = ROOT / 'docs' / 'swagger.json'
POSTMAN = ROOT / 'postman' / 'pawnshop.postman_collection.json'


def load_json(p: Path):
    with p.open('r', encoding='utf-8') as f:
        return json.load(f)


def save_json(p: Path, data):
    with p.open('w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def build_example_from_schema(schema, definitions):
    # If schema has $ref, deref
    if not schema:
        return None
    if '$ref' in schema:
        ref = schema['$ref']
        # ref like "#/definitions/Model"
        name = ref.split('/')[-1]
        defn = definitions.get(name)
        if not defn:
            return None
        props = defn.get('properties', {})
        sample = {}
        for k, v in props.items():
            t = v.get('type')
            if t == 'string':
                sample[k] = v.get('example', '') or f"{k}_example"
            elif t == 'integer' or t == 'number':
                sample[k] = v.get('example', 0)
            elif t == 'boolean':
                sample[k] = v.get('example', False)
            elif t == 'array':
                items = v.get('items', {})
                itm = build_example_from_schema(items, definitions)
                sample[k] = [itm] if itm is not None else []
            elif t == 'object' or 'properties' in v:
                sample[k] = build_example_from_schema(v, definitions) or {}
            else:
                sample[k] = None
        return sample
    else:
        # primitive
        t = schema.get('type')
        if t == 'string':
            return schema.get('example', '') or 'string'
        if t in ('integer', 'number'):
            return schema.get('example', 0)
        if t == 'boolean':
            return schema.get('example', False)
        if t == 'array':
            itm = build_example_from_schema(schema.get('items'), definitions)
            return [itm] if itm is not None else []
    return None


def find_swagger_response_example(swagger, path, method):
    paths = swagger.get('paths', {})
    p = paths.get(path)
    if not p:
        return None
    op = p.get(method.lower())
    if not op:
        return None
    responses = op.get('responses', {})
    r200 = responses.get('200') or responses.get('201')
    if not r200:
        return None
    # Try to find content->application/json->example
    content = r200.get('content', {})
    appj = content.get('application/json')
    if appj:
        if 'example' in appj:
            return appj['example']
        # OpenAPI may have examples: { key: { value: ... } }
        examples = appj.get('examples')
        if isinstance(examples, dict):
            first = next(iter(examples.values()))
            if isinstance(first, dict) and 'value' in first:
                return first['value']
        schema = appj.get('schema')
        defs = swagger.get('definitions', {})
        ex = build_example_from_schema(schema, defs)
        return ex
    # Fallback: try schema directly under r200
    schema = r200.get('schema')
    if schema:
        ex = build_example_from_schema(schema, swagger.get('definitions', {}))
        return ex
    return None


def normalize_path(raw_path):
    # swagger paths are like /api/v1/transactions
    # postman may include host var; assume raw contains path
    if raw_path.startswith('http'):
        # strip host
        parts = raw_path.split('://', 1)[1].split('/', 1)
        if len(parts) > 1:
            return '/' + parts[1]
        return '/'
    return raw_path


def main():
    if not SWAGGER.exists():
        print('swagger.json not found at', SWAGGER)
        sys.exit(1)
    if not POSTMAN.exists():
        print('postman collection not found at', POSTMAN)
        sys.exit(1)

    swagger = load_json(SWAGGER)
    postman = load_json(POSTMAN)

    changed = False
    for item in postman.get('item', []):
        req = item.get('request', {})
        url = req.get('url', {})
        raw = url.get('raw') or ''
        path = normalize_path(raw)
        method = req.get('method', 'GET').lower()
        example = find_swagger_response_example(swagger, path, method)
        if example is None:
            continue
        # ensure response array exists
        resp_list = item.get('response')
        if not isinstance(resp_list, list) or len(resp_list) == 0:
            item['response'] = [
                {
                    'name': 'Example - generated',
                    'status': 'OK',
                    'code': 200,
                    '_body': None,
                    'body': json.dumps(example, ensure_ascii=False),
                    'header': [],
                }
            ]
            changed = True
        else:
            # update first response body if different
            existing_body = resp_list[0].get('body', '')
            new_body = json.dumps(example, ensure_ascii=False)
            if existing_body != new_body:
                resp_list[0]['body'] = new_body
                changed = True

    if changed:
        save_json(POSTMAN, postman)
        print('Postman collection updated from swagger examples.')
    else:
        print('No updates from swagger examples.')


if __name__ == '__main__':
    main()
