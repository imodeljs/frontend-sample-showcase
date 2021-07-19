// START RULE_DATA
export const jsonRuleData = {
  propertyValueRule: {
    name: "Pitch Range",
    description: "Rule Description",
    creationDateTime: "2021-06-17T14:45:47.753Z",
    modificationDateTime: "2021-06-24T14:49:59.399Z",
    templateId: "d9164c2b-e55d-4982-a833-14a851007948",
    functionParameters: {
      propertyName: "Pitch",
      lowerBound: "1",
      upperBound: "2",
    },
    severity: "medium",
    ecSchema: "ArchitecturalPhysical",
    ecClass: "Door",
    ecWhere: "Roll = '10'",
    functionName: "PropertyValueSumAtLeast",
    dataType: "property",
    _links: {
      createdBy: {
        href: "https://api.bentley.com/projects/38b7e366-bc20-4bb1-9572-0797cf5221fd/members/fd4c4a79-e24a-4b35-9faf-f4fa6f4fa62b",
      },
      lastModifiedBy: {
        href: "https://api.bentley.com/projects/38b7e366-bc20-4bb1-9572-0797cf5221fd/members/fd4c4a79-e24a-4b35-9faf-f4fa6f4fa62b",
      },
    },
  },
};
// END RULE_DATA
