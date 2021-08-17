// START RULE_DATA
export const jsonRuleData = {
  rule: {
    displayName: "OperatingTemperatureRange",
    description: "Verifies the Operating Temperature falls in a given range",
    creationDateTime: "2021-08-06T19:00:53.79Z",
    modificationDateTime: "2021-08-06T19:00:53.79Z",
    templateId: "53c7581a-90d7-48c8-8970-23b6b8628b7d",
    functionParameters: {
      propertyName: "OPERATING_TEMPERATURE",
      lowerBound: "0",
      upperBound: "100",
    },
    severity: "medium",
    ecSchema: "ProcessPhysical",
    ecClass: "EQUIPMENT",
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
};
// END RULE_DATA
