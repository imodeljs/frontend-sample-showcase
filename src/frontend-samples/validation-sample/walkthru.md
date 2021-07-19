# Retrieving Rules and Violations

In order to retrieve the list of `validation rules`, we need to send a request to the [Validation REST API](https://developer.bentley.com/api-groups/project-delivery/apis/validation/). The Validation API allows you to create, run, and evaluate the results of validation rules. These rules are applied to each element when a test is run, and any elements found to be in violation of the rules are returned, along with the specific test that the element failed.

Since the sample showcase is a read-only environment, the sample itself does not attempt to create a test, instead using hardcoded data that matches the format of a response from the API.

[_metadata_:annotation]:- "VALIDATION_API"

# Example API Call

Above is an example of how to make a request from the API. In this case, a request is being made to retrieve a list of the different tests that exist in the current project. The request url is what specifies the request being made, in this case `https://api.bentley.com/projects/${projectId}/validation/tests` is specifying that a list of validation tests should be returned from the current project. Also note that we are attaching an access token to our request options, as we need to have specific privileges in order to access the test information.

[_metadata_:annotation]:- "API_EXAMPLE"

# Validation Rule Format

Above is the format for an API response to requesting data about a specific test. The `templateId` is the id of the test that we requested information about. The `functionParameters` specifies what the test is evaluating. In this case, we can see that all elements being tested must have a pitch value falling between 1 and 2. `ecSchema`, `ecClass`, and `ecWhere` all specify the attributes of elements that the test will be applied to. In this case, the test is only being run on elements with an ecSchema of ArchitecturalPhysical, a ecClass of Door, and a Roll equal to 10.  

Note that these values currently do not match the actual element ids being shown from the imodel, they are just being used to demonstrate the response format of the API.

[_metadata_:annotation]:- "RULE_DATA"

# Validation Result Format

Above is the format for an API response to requesting data about the result of running a test. The response has two parts, `propertyValueResult` shows the elements in violation of specific rules, and `ruleList` gives the ids of all the rules that are being violated.

Each element of `propertyValueResult` has four parts. First and second are the id and label of the element that violated a rule. Third is the index of the rule in the ruleList, which can be used to get more information about the specific rule that was violated. Fourth is the element's invalid value for the attribute that was being tested.

The `ruleList` has two parts. The first is the id of the rule, which can be used to request additional data about the test from the API. The second is the name of the rule.
[_metadata_:annotation]:- "RESULT_DATA"


# Violation Table

After using the Validation API to retrieve all of the active rule information and the element IDs of all elements in violation of a rule, the sample combines these two data sources in a table. First, we can consult the list of all elements in violation of a rule, which also provides the id of the rule that was violated by the element. 

With the rule id, we can make another API call requesting more information about the rule, such as the value or range of values that are acceptable for the rule or the ecClass of elements that the rule is being applied to.

[_metadata_:annotation]:- "VIOLATION_TABLE"
