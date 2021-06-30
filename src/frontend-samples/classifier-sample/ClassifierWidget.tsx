/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect } from "react";
import { useActiveIModelConnection, useActiveViewport } from "@bentley/ui-framework";
import { SpatialClassifier, SpatialClassifierFlags, SpatialClassifierInsideDisplay, SpatialClassifierOutsideDisplay } from "@bentley/imodeljs-common";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { KeySet } from "@bentley/presentation-common";
import { Input, Select } from "@bentley/ui-core";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { ISelectionProvider, SelectionChangeEventArgs } from "@bentley/presentation-frontend";
import ClassifierApi from "./ClassifierApi";
import { ClassifierProperties } from "./ClassifierProperties";
import "./Classifier.scss";

const ClassifierWidget: React.FunctionComponent = () => {
	const _insideDisplayEntries: { [key: string]: string } = {};
	_insideDisplayEntries[SpatialClassifierInsideDisplay.ElementColor] = "ElementColor";
	_insideDisplayEntries[SpatialClassifierInsideDisplay.Off] = "Off";
	_insideDisplayEntries[SpatialClassifierInsideDisplay.On] = "On";
	_insideDisplayEntries[SpatialClassifierInsideDisplay.Dimmed] = "Dimmed";
	_insideDisplayEntries[SpatialClassifierInsideDisplay.Hilite] = "Hilite";

	const _outsideDisplayEntries: { [key: string]: string } = {};
	_outsideDisplayEntries[SpatialClassifierOutsideDisplay.On] = "Off";
	_outsideDisplayEntries[SpatialClassifierOutsideDisplay.Off] = "On";
	_outsideDisplayEntries[SpatialClassifierOutsideDisplay.Dimmed] = "Dimmed";

	const iModelConnection = useActiveIModelConnection();
	const viewport = useActiveViewport();
	const [initalized, setInitalized] = React.useState<boolean>(false);
	const [classifiers, setClassifiers] = React.useState<{ [key: string]: string }>({});
	const [currentClassifier, setCurrentClassifier] = React.useState<string>();
	const [expandDistState, setExpandDistState] = React.useState<number>(3);
	const [outsideDisplayKeyState, setOutsideDisplayKeyState] = React.useState<string>(_insideDisplayEntries[SpatialClassifierInsideDisplay.Dimmed]);
	const [insideDisplayKeyState, setInsideDisplayKeyState] = React.useState<string>(_insideDisplayEntries[SpatialClassifierInsideDisplay.ElementColor]);
	const [keysState, setKeysState] = React.useState<KeySet>(new KeySet());

	/**
* This callback will be executed by once the iModel and view has been loaded.
* The reality model will default to on.
*/
	useEffect(() => {
		if (iModelConnection) {
			ClassifierApi.addSelectionListener(_onSelectionChanged);
		}

		/** Turn on RealityData and initalize the classifierState */
		if (!initalized && viewport && iModelConnection) {
			ClassifierApi.turnOnAvailableRealityModel(viewport, iModelConnection).then(() => {
				ClassifierApi.getAvailableClassifierListForViewport(viewport).then((_classifiers) => {
					const commercialModelId = Object.keys(_classifiers)[0];
					setClassifiers(_classifiers);
					setCurrentClassifier(commercialModelId);
				});
			});

			setInitalized(true);
		}

		/** On Widget deleteion, remove the selection listener */
		return () => {
			ClassifierApi.removeSelectionListener();
		};
	}, [iModelConnection, viewport, initalized]);

	/*
* Get property values for the classifier.
*/
	const getClassifierValues = useCallback((modelId: string): SpatialClassifier => {
		// const flags = new SpatialClassificationProps.Flags();

		const flags = new SpatialClassifierFlags(
			SpatialClassifierInsideDisplay[insideDisplayKeyState as keyof typeof SpatialClassifierInsideDisplay],
			SpatialClassifierOutsideDisplay[outsideDisplayKeyState as keyof typeof SpatialClassifierOutsideDisplay],
			false
		);

		const classifier = new SpatialClassifier(
			modelId,
			`${modelId}`,
			flags,
			expandDistState,
		)

		return classifier;
	}, [expandDistState, insideDisplayKeyState, outsideDisplayKeyState]);

	useEffect(() => {
		const vp = IModelApp.viewManager.selectedView;
		setKeysState(new KeySet());
		if (vp) {
			const classifier: SpatialClassifier = getClassifierValues(currentClassifier!);
			ClassifierApi.updateRealityDataClassifiers(vp, classifier);
		}
	}, [currentClassifier, getClassifierValues]);

	/** When the user selects an element, grab the keys */
	const _onSelectionChanged = async (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
		const selection = selectionProvider.getSelection(evt.imodel, evt.level);
		const keys = new KeySet(selection);
		setKeysState(keys);
	};

	// Some reasonable defaults depending on what classifier is chosen.
	const _onClassifierChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
		if (classifiers[event.target.value].includes("Buildings")) {
			setInsideDisplayKeyState("On");
			setExpandDistState(3.5);
		}
		if (classifiers[event.target.value].includes("Streets")) {
			setInsideDisplayKeyState("Hilite");
			setExpandDistState(2);
		}
		if (classifiers[event.target.value].includes("Commercial")) {
			setInsideDisplayKeyState("ElementColor");
			setExpandDistState(1);
		}
		if (classifiers[event.target.value].includes("Street Poles")) {
			setInsideDisplayKeyState("Hilite");
			setExpandDistState(1);
		}

		setCurrentClassifier(event.target.value);
		setOutsideDisplayKeyState("Dimmed");
	};

	const _onMarginChange = (event: any) => {
		try {
			const expandDist = parseFloat(event.target.value);
			setExpandDistState(expandDist);
		} catch { }
	};

	const _onOutsideDisplayChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
		setOutsideDisplayKeyState(event.target.value);
	};

	const _onInsideDisplayChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
		setInsideDisplayKeyState(event.target.value);
	};

	return (
		<div className="sample-options">
			<div className="sample-options-2col" style={{ gridTemplateColumns: "1fr 2fr" }}>
				<span>Select classifier:</span>
				<Select className="classification-dialog-select" options={classifiers} onChange={_onClassifierChange} />
				<span>Margin:</span>
				<Input type="number" min="0" max="100" value={expandDistState} onChange={_onMarginChange} />
				<span>Outside Display:</span>
				<Select options={_outsideDisplayEntries} value={outsideDisplayKeyState} onChange={_onOutsideDisplayChange} />
				<span>Inside Display:</span>
				<Select options={_insideDisplayEntries} value={insideDisplayKeyState} onChange={_onInsideDisplayChange} />
				<span></span>
				<ClassifierProperties keys={keysState} imodel={iModelConnection} />
			</div>
		</div>
	);
};

export class ClassifierWidgetProvider implements UiItemsProvider {
	public readonly id: string = "ClassifierWidgetProvider";

	public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
		const widgets: AbstractWidgetProps[] = [];
		if (location === StagePanelLocation.Right) {
			widgets.push(
				{
					id: "ClassifierWidget",
					label: "Classifier Selector",
					defaultState: WidgetState.Floating,
					// eslint-disable-next-line react/display-name
					getWidgetContent: () => <ClassifierWidget />,
				}
			);
		}
		return widgets;
	}
}
