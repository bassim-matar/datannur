#!/usr/bin/env python3
"""Validate JSON schemas and data files against schemas."""

import json
import sys
from pathlib import Path
from jsonschema import Draft7Validator
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT7

script_dir = Path(__file__).parent
public_dir = script_dir.parent

package_json = json.loads((public_dir / "package.json").read_text())
db_path = package_json["datannur"]["dbPath"]
schemas_path = package_json["datannur"]["schemasPath"]

schemas_dir = public_dir / schemas_path
data_dir = public_dir / db_path

# Collect schema files
data_schemas = [
    {"file": f.name, "dir": schemas_dir, "type": "data"}
    for f in schemas_dir.glob("*.schema.json")
    if not f.name.startswith("__")
]

user_data_dir = schemas_dir / "userData"
user_data_schemas = (
    [{"file": f.name, "dir": user_data_dir, "type": "userData"} for f in user_data_dir.glob("*.schema.json")]
    if user_data_dir.exists()
    else []
)

schema_files = data_schemas + user_data_schemas

# Load meta-schema
meta_schema = json.loads((schemas_dir / "__meta__.schema.json").read_text())
meta_validator = Draft7Validator(meta_schema)

errors = 0
schemas: dict[str, dict] = {}

print("📋 Validating schemas...")
for item in schema_files:
    schema_path = item["dir"] / item["file"]
    schema = json.loads(schema_path.read_text())

    meta_errors = list(meta_validator.iter_errors(schema))
    if meta_errors:
        print(f"❌ {item['file']} (meta-schema):")
        for err in meta_errors:
            print(f"  {err.message}")
        errors += 1
        continue

    entity_name = item["file"].replace(".schema.json", "")
    schemas[entity_name] = schema

if errors > 0:
    print(f"\n❌ {errors} schema(s) invalid\n")
    sys.exit(1)

print(f"✅ {len(schema_files)} schemas valid\n")

print("🔍 Validating data files...")
total_items = 0

registry = Registry().with_resources([
    (name, Resource.from_contents(schema, default_specification=DRAFT7))
    for name, schema in schemas.items()
])

for item in schema_files:
    if item["type"] == "userData":
        continue

    entity_name = item["file"].replace(".schema.json", "")
    data_file = data_dir / f"{entity_name}.json"

    if not data_file.exists():
        continue

    try:
        data = json.loads(data_file.read_text())
        validator = Draft7Validator(schemas[entity_name], registry=registry)
        validation_errors = list(validator.iter_errors(data))

        if validation_errors:
            print(f"❌ {entity_name}.json:")
            for err in validation_errors:
                path = ".".join(str(p) for p in err.absolute_path) or entity_name
                print(f"  {path}: {err.message}")
            errors += 1
        elif isinstance(data, list):
            total_items += len(data)
    except json.JSONDecodeError as e:
        print(f"❌ {entity_name}.json: {e}")
        errors += 1

if errors > 0:
    print(f"\n❌ Validation failed\n")
    sys.exit(1)

print(f"✅ {total_items} items validated")
sys.exit(0)
