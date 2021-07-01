import { IModelConnection } from "@bentley/imodeljs-frontend";
import { InstanceKey, Key, KeySet, NodeKey } from "@bentley/presentation-common";
import { PresentationLabelsProvider } from "@bentley/presentation-components";
import { HiliteSetProvider, ISelectionProvider, Presentation, SelectionChangeEventArgs } from "@bentley/presentation-frontend";
import { Button, ButtonType, Select, Toggle } from "@bentley/ui-core";
import { useActiveIModelConnection } from "@bentley/ui-framework";
import React, { ChangeEvent, useEffect } from "react";

interface ElementPickerProps {
  //Uses HiliteSet to select all of the children of selected/queried elements. Default to False
  includeChildren?: boolean,
  //Shows a list of elements that can be added to or removed from. Default to False
  multiSelect?: boolean,
  elementCallback: (elements: any) => void,
}

interface CategoryData {
  query: string,
  userLabel: string,
}

class IModelDefaultElements {
  static BayTown = [
    { query: "SELECT EcInstanceId, EcClassid FROM ProcessPhysical.SHELL_AND_TUBE_HEAT_EXCHANGER_PAR", userLabel: "SHELL_AND_TUBE_HEAT_EXCHANGER_PAR" },
    { query: "SELECT EcInstanceId, EcClassid FROM ProcessPhysical.VERTICAL_VESSEL_PAR", userLabel: "VERTICAL_VESSEL_PAR" },
    { query: "SELECT EcInstanceId, EcClassid FROM ProcessPhysical.PLATE_TYPE_HEAT_EXCHANGER", userLabel: "PLATE_TYPE_HEAT_EXCHANGER" },
    { query: "SELECT EcInstanceId, EcClassid FROM ProcessPhysical.REBOILER_PAR", userLabel: "REBOILER_PAR" }
  ]
  static Metrostation = [
    { query: `select EcInstanceId, EcClassid from BuildingDataGroup.Stair`, userLabel: "Stairs" },
    { query: `select EcInstanceId, EcClassid from BuildingDataGroup.plumbingfixtures`, userLabel: "Plumbing Fixtures" },
    { query: `select EcInstanceId, EcClassid from BuildingDataGroup.escalators`, userLabel: "escalators" },
    { query: `select EcInstanceId, EcClassid from BuildingDataGroup.flexduct`, userLabel: "ducts" },
    { query: `select EcInstanceId, EcClassid from bis.element Where UserLabel = 'Ticket_Entry_Tripod_Turnstile'`, userLabel: "Turnstiles" },
  ]
  static RetailBuilding = [
    { query: `select EcInstanceId, EcClassid from BuildingDataGroupWS.Window`, userLabel: "Windows" },
    { query: `select EcInstanceId, EcClassid from BuildingDataGroupWS.Door`, userLabel: "Door" },
    { query: `select EcInstanceId, EcClassid from BuildingDataGroupWS.Stair`, userLabel: "Stair" },
    { query: `select ecinstanceid, EcClassid from Buildingdatagroupws.PlumbingFixtures`, userLabel: "PlumbingFixtures" },
  ]
  static House = [
    { query: `SELECT ECInstanceId, EcClassid FROM BisCore.GeometricElement3d WHERE Category.Id IN (SELECT ECInstanceId FROM BisCore.SpatialCategory WHERE CodeValue IN ('WINDOWS 2ND','WINDOWS 1ST'))`, userLabel: "windows" },
    { query: `SELECT ECInstanceId, EcClassid FROM BisCore.GeometricElement3d WHERE Category.Id IN (SELECT ECInstanceId FROM BisCore.SpatialCategory WHERE CodeValue IN ('floor lamp'))`, userLabel: "floor lamp" },
    { query: `SELECT ECInstanceId, EcClassid FROM BisCore.GeometricElement3d WHERE Category.Id IN (SELECT ECInstanceId FROM BisCore.SpatialCategory WHERE CodeValue IN ('Roof'))`, userLabel: "Roof" },
    { query: `SELECT ECInstanceId, EcClassid FROM BisCore.GeometricElement3d WHERE Category.Id IN (SELECT ECInstanceId FROM BisCore.SpatialCategory WHERE CodeValue IN ('Deck'))`, userLabel: "Deck" },
  ]
  static Stadium = [
    { query: `select EcInstanceId from BuildingDataGroup.Stair`, userLabel: "Stairs" },

  ]
  static ExtonCampus = [
    { query: `select ecInstanceId from BuildingDataGroupWS.Door`, userLabel: "Doors" },

  ]
}

function getDefaultElementData(iModelName: string) {
  let defaultElements: CategoryData[] = []
  if (iModelName === 'BayTown')
    defaultElements = IModelDefaultElements.BayTown
  if (iModelName === 'Metrostation2')
    defaultElements = IModelDefaultElements.Metrostation
  if (iModelName === 'iModel Hub Website seed file')
    defaultElements = IModelDefaultElements.RetailBuilding
  if (iModelName === 'house bim upload')
    defaultElements = IModelDefaultElements.House
  if (iModelName === 'Stadium')
    defaultElements = IModelDefaultElements.Stadium
  if (iModelName === 'Exton Campus v2')
    defaultElements = IModelDefaultElements.ExtonCampus

  return defaultElements
}

export const ElementPicker: React.FunctionComponent<ElementPickerProps> = (props: ElementPickerProps) => {
  const iModelConnection = useActiveIModelConnection();
  const selfSelectText = "SELECT YOUR OWN"
  const labelProvider = new PresentationLabelsProvider({ imodel: iModelConnection! })
  const [allowSelection, setAllowSelection] = React.useState<boolean>(false)
  const [currentCategory, setCurrentCategory] = React.useState<CategoryData>()
  const [currentElementOptions, setCurrentElementOptions] = React.useState<any[]>([])
  const [currentElement, setCurrentElement] = React.useState<any[]>([])
  const [elementList, setElementList] = React.useState<any[]>([])

  useEffect(() => {
    if (iModelConnection) {
      const elementData = getDefaultElementData(iModelConnection.name)
      setCurrentCategory(elementData[0])
    }
  }, [])

  useEffect(() => {
    if (allowSelection)
      Presentation.selection.selectionChange.addListener(handleClickSelection);
    else
      Presentation.selection.selectionChange.removeListener(handleClickSelection);
  }, [allowSelection])

  useEffect(() => {
    getElementOptions()
  }, [currentCategory])

  useEffect(() => {
    if (currentElementOptions.length > 0)
      setCurrentElement([currentElementOptions[0].value])
  }, [currentElementOptions])

  useEffect(() => {
    if (currentElement) {
      if (props.multiSelect) {

      } else {
        setElementList(currentElement)
      }
    }
  }, [currentElement])

  useEffect(() => {
    props.elementCallback(elementList);
  }, [elementList])

  const getElementOptions = async () => {
    if (iModelConnection && currentCategory) {
      const rows = [];
      let count = 1;
      for await (const row of iModelConnection.query(currentCategory.query)) {
        const re = /\./gi
        const key: InstanceKey = { className: row.className.replace(re, ':'), id: row.id }
        const newLabel = await labelProvider.getLabel(key)
        rows.push({ label: newLabel, value: row.id })
        count += 1;
      }
      setCurrentElementOptions(rows)
    }
  }

  const handleClickSelection = (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
    if (allowSelection && iModelConnection && currentCategory) {
      const selection = selectionProvider.getSelection(evt.imodel, evt.level);
      const rows: any[] = [];
      selection.forEach(async (key: Key) => {
        if (Key.isInstanceKey(key)) {
          const queryById = `select ECClassId FROM bis.element WHERE ECInstanceId = ${key.id}`
          let className = ""

          for await (const row of iModelConnection.query(queryById)) {
            className = row.className
          }
          const re = /\./gi
          const newKey: InstanceKey = { className: className.replace(re, ':'), id: key.id }
          const newLabel = await labelProvider.getLabel(newKey)
          rows.push({ label: newLabel, value: key.id })
        }
        setCurrentElementOptions(rows)
      })
    }
  };

  const handleCategoryListSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event && event.target && event.target.value) {
      const selection = event.target.value
      if (selection === selfSelectText) {
        setAllowSelection(true)
      } else {
        setAllowSelection(false)
        setCurrentCategory({ query: event.target.value, userLabel: event.target.options[event.target.selectedIndex].text })
      }
    }
  }

  const handleInstanceListSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event && event.target && event.target.value) {
      setCurrentElement([event.target.value])
    }
  }

  const getDefaultElementSelection = (iModelName: string) => {
    const elementData = getDefaultElementData(iModelName)
    const elementOptions = elementData.map(function (data) {
      return { label: data.userLabel, value: data.query }
    })
    elementOptions.push({ label: selfSelectText, value: selfSelectText })
    return elementOptions
  }

  return (
    <>
      <div>
        <span>Element List</span>
        <Select options={(iModelConnection ? getDefaultElementSelection(iModelConnection.name) : [])} onChange={handleCategoryListSelection} />
        <Select options={currentElementOptions} onChange={handleInstanceListSelection} />
        <span />
      </div>
    </>
  )
}