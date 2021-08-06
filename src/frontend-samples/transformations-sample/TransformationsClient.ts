/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizedClientRequestContext, request, Response } from "@bentley/itwin-client";
import { AuthorizedFrontendRequestContext,IModelApp } from "@bentley/imodeljs-frontend";
import { AuthorizationClient } from "@itwinjs-sandbox";
import { GuidString } from "@bentley/bentleyjs-core";

export interface Transformation {
  id: GuidString;
  status: string;
  errorMessage: string;
  processedElementCount: number;
  totalElementCount: number;
  startedDateTime: Date;
  finishedDateTime: Date;
  configurationId: GuidString;
  sourceChangeSetId: string;
}

export default class TransformationsClient {
  private static _requestContext: AuthorizedClientRequestContext;

  public static async getTransformation(transformationId: string): Promise<Transformation | undefined> {
    //const url = `https://sbx-api.bentley.com/transformations/transformations/${transformationId}`;
    const url = `https://imodeltransformations-eus.bentley.com/api/v1.0/Transformations/${transformationId}`;
    const options = {
      method: "GET",
      headers: {
        //Authorization: (await TransformationsClient.getAccessToken())?.toTokenString(IncludePrefix.Yes),
        Authorization: "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IkJlbnRsZXlJTVMiLCJwaS5hdG0iOiJhOG1lIn0.eyJzY29wZSI6WyJvcGVuaWQiLCJpbW9kZWwtdHJhbnNmb3JtZXItc2VydmljZSIsImltb2RlbGpzLWFnZW50LW9yY2hlc3RyYXRvciIsImltb2RlbGh1YiIsInJiYWMtc2VydmljZSIsInByb2R1Y3Qtc2V0dGluZ3Mtc2VydmljZSJdLCJjbGllbnRfaWQiOiJpbW9kZWwtdHJhbnNmb3JtZXItc2VydmljZS1jbGllbnQiLCJhdWQiOlsiaHR0cHM6Ly9pbXMuYmVudGxleS5jb20vYXMvdG9rZW4ub2F1dGgyIiwiaHR0cHM6Ly9pbXNvaWRjLmJlbnRsZXkuY29tL2FzL3Rva2VuLm9hdXRoMiIsImh0dHBzOi8vaW1zb2lkYy5iZW50bGV5LmNvbS9yZXNvdXJjZXMiLCJpbW9kZWwtdHJhbnNmb3JtZXItc2VydmljZS1hcGkiLCJpbW9kZWxqcy1hZ2VudC1mcmFtZXdvcmsiLCJpbW9kZWwtaHViLXNlcnZpY2VzLTI0ODUiLCJyYmFjLTI1NjMiLCJwcm9kdWN0LXNldHRpbmdzLXNlcnZpY2UtMjc1MiJdLCJzdWIiOiJkZTFhODM1Ny0wOWM1LTQwMTAtYWEzMi0wNGFjOWM4OTI3MWIiLCJyb2xlIjpbIk5vU3luY1dpdGhTQVAiLCJCRU5UTEVZX0VNUExPWUVFIl0sIm9yZyI6ImZhYjk3NzRiLWIzMzgtNGNjMi1hNmM5LTQ1OGJkZjdmOTY2YSIsInN1YmplY3QiOiJkZTFhODM1Ny0wOWM1LTQwMTAtYWEzMi0wNGFjOWM4OTI3MWIiLCJpc3MiOiJodHRwczovL2ltc29pZGMuYmVudGxleS5jb20iLCJlbnRpdGxlbWVudCI6WyJTRUxFQ1RfMjAwNiIsIkJETiIsIklOVEVSTkFMIiwiQkVOVExFWV9MRUFSTiJdLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJEdXN0aW4uTGVic29ja0BiZW50bGV5LmNvbSIsImdpdmVuX25hbWUiOiJEdXN0aW4iLCJzaWQiOiJocmY5OE9xcTBlU2I4eXRhUmJiems4aDZBZXMuU1UxVExVSmxiblJzWlhrdFZWTS5DLXl6LnpBSHpmVWl5WTVZUnRoWmNtY2Y5OUM0bEsiLCJuYmYiOjE2MjgxNzM2NjksInVsdGltYXRlX3NpdGUiOiIxMDAxMzg5MTE3IiwidXNhZ2VfY291bnRyeV9pc28iOiJVUyIsImF1dGhfdGltZSI6MTYyODE3Mzk2OSwibmFtZSI6IkR1c3Rpbi5MZWJzb2NrQGJlbnRsZXkuY29tIiwib3JnX25hbWUiOiJCZW50bGV5IFN5c3RlbXMgSW5jIiwiZmFtaWx5X25hbWUiOiJMZWJzb2NrIiwiZW1haWwiOiJEdXN0aW4uTGVic29ja0BiZW50bGV5LmNvbSIsImV4cCI6MTYyODE3NzU3N30.DAcXbSy7F7vV4aZKZkxjED6VUypFaUoGeTNokz2OJ6olRysE6c1UyIPO0bK7yd7lV7EStDBp6_-rHzISep7sOKClQdg1bOGTb_JqzQHqd6gghBNezY7qM3CBJVEvDkaIbFbBEX3Ec-B-H6sJjAgZj7yCAgv-imY8HMqlnT8IIheJ7Lk227P3MapG32aqYxMlh6KOgDynCTlWNV1E4t9FIG2o4ZTa4_nW3npJLF19shpSCr19Udu1R6zGe6EZD9dEC_MgVMKITzhtbnMbV_9sNcaqocmTke_Hfe6Ov5RdQzUXBkELuBI_Z9ux9PO5cF_qg5xEKDu_aJnr_IGAURRTjg",
      },
    };
    return request(await TransformationsClient.getRequestContext(), url, options)
      .then((resp: Response): Transformation | undefined => {
        if (resp.body === undefined) return undefined;
        return resp.body;
      }).catch((_reason: any) => {
        return undefined;
      });
  }

  private static async getAccessToken() {
    try {
      return (IModelApp.authorizationClient as AuthorizationClient).getDevAccessToken();
    } catch (e) {
      return undefined;
    }
  }

  private static async getRequestContext() {
    if (!TransformationsClient._requestContext) {
      TransformationsClient._requestContext = await AuthorizedFrontendRequestContext.create();
    }
    return TransformationsClient._requestContext;
  }
}