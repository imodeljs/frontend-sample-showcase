/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

// Property Validation Rule Sample Data
// START RULE_DATA
export const jsonRuleData = [{
  rule: {
    displayName: "MinimumHeight",
    description: "Verifies the height of equipment is at least 1",
    creationDateTime: "2021-08-20T16:08:31.947Z",
    modificationDateTime: "2021-08-20T16:08:31.946Z",
    templateId: "3a9456f1-1f31-4d61-99fd-25583e8cf038",
    functionParameters: {
      propertyName: "HEIGHT",
      lowerBound: "1",
    },
    severity: "medium",
    ecSchema: "ProcessPhysical",
    ecClass: "EQUIPMENT",
    whereClause: "UNIT>=0",
    functionName: "PropertyValueAtLeast",
    dataType: "property",
    _links: {
      createdBy: {
        href: "https://api.bentley.com/projects/2ea956d4-7666-44dc-8e37-ca8ba27c9692/members/bb7e2a6e-c9cc-4881-a652-54fc0038b8c6",
      },
      lastModifiedBy: {
        href: "https://api.bentley.com/projects/2ea956d4-7666-44dc-8e37-ca8ba27c9692/members/bb7e2a6e-c9cc-4881-a652-54fc0038b8c6",
      },
    },
  },
},
{
  rule: {
    displayName: "NominalDiameterRange",
    description: "Checks if each gasket has a Nominal Diameter between 0.1 and 0.2",
    creationDateTime: "2021-08-20T17:21:12.363Z",
    modificationDateTime: "2021-08-20T17:21:12.363Z",
    templateId: "53c7581a-90d7-48c8-8970-23b6b8628b7d",
    functionParameters: {
      propertyName: "NOMINAL_DIAMETER",
      upperBound: "0.2",
      lowerBound: "0.1",
    },
    severity: "medium",
    ecSchema: "ProcessPhysical",
    ecClass: "Gasket",
    whereClause: "UNIT>=0",
    functionName: "PropertyValueRange",
    dataType: "property",
    _links: {
      createdBy: {
        href: "https://api.bentley.com/projects/2ea956d4-7666-44dc-8e37-ca8ba27c9692/members/bb7e2a6e-c9cc-4881-a652-54fc0038b8c6",
      },
      lastModifiedBy: {
        href: "https://api.bentley.com/projects/2ea956d4-7666-44dc-8e37-ca8ba27c9692/members/bb7e2a6e-c9cc-4881-a652-54fc0038b8c6",
      },
    },
  },
},

{
  rule: {
    displayName: "FuncInstIdDefined",
    description: "Checks if each nozzle has a defined FUNC_INST_ID",
    creationDateTime: "2021-08-20T16:35:07.793Z",
    modificationDateTime: "2021-08-20T16:35:07.793Z",
    templateId: "a5896553-e248-4619-b7c8-5bcb4878e51c",
    functionParameters: {
      propertyName: "FUNC_INST_ID",
    },
    severity: "medium",
    ecSchema: "ProcessPhysical",
    ecClass: "Nozzle",
    whereClause: "UNIT>=0",
    functionName: "PropertyValueDefined",
    dataType: "property",
    _links: {
      createdBy: {
        href: "https://api.bentley.com/projects/2ea956d4-7666-44dc-8e37-ca8ba27c9692/members/bb7e2a6e-c9cc-4881-a652-54fc0038b8c6",
      },
      lastModifiedBy: {
        href: "https://api.bentley.com/projects/2ea956d4-7666-44dc-8e37-ca8ba27c9692/members/bb7e2a6e-c9cc-4881-a652-54fc0038b8c6",
      },
    },
  },
},
];
// END RULE_DATA
