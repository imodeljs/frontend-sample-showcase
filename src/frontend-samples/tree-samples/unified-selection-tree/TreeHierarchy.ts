/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ChildNodeSpecificationTypes, RelationshipDirection, Ruleset, RuleTypes } from "@itwin/presentation-common";

const TreeHierarchy: Ruleset = {
  id: "TreeHierarchy",
  requiredSchemas:
    [
      { name: "BisCore" },
    ],
  rules: [
    {
      ruleType: RuleTypes.RootNodes,
      specifications: [
        {
          specType: ChildNodeSpecificationTypes.InstanceNodesOfSpecificClasses,
          classes: [
            {
              schemaName: "BisCore",
              classNames: [
                "GeometricModel3d",
              ],
            },
          ],
          arePolymorphic: true,
          groupByClass: false,
          groupByLabel: false,
        },
      ],
    },
    {
      ruleType: RuleTypes.ChildNodes,
      condition: "ParentNode.IsOfClass(\"GeometricModel3d\", \"BisCore\")",
      specifications: [
        {
          specType: ChildNodeSpecificationTypes.RelatedInstanceNodes,
          relationshipPaths: [
            {
              relationship: {
                schemaName: "BisCore",
                className: "ModelContainsElements",
              },
              direction: RelationshipDirection.Forward,
              targetClass: {
                schemaName: "BisCore",
                className: "GeometricElement3d",
              },
            },
          ],
          groupByClass: false,
          groupByLabel: false,
        },
      ],
    },
    {
      ruleType: RuleTypes.ChildNodes,
      condition: "ParentNode.IsOfClass(\"GeometricElement3d\", \"BisCore\")",
      specifications: [
        {
          specType: ChildNodeSpecificationTypes.RelatedInstanceNodes,
          relationshipPaths: [
            {
              relationship: {
                schemaName: "BisCore",
                className: "ElementOwnsChildElements",
              },
              direction: RelationshipDirection.Forward,
              targetClass: {
                schemaName: "BisCore",
                className: "GeometricElement3d",
              },
            },
          ],
          groupByClass: false,
          groupByLabel: false,
        },
      ],
    },
  ],
};

export default TreeHierarchy;
