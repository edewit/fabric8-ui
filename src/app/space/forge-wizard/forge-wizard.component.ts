
import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';

import { WizardComponent, WizardConfig, WizardStepConfig, WizardEvent } from 'patternfly-ng';
import { ForgeService } from "app/space/forge-wizard/forge.service";
import { Gui, Input } from "app/space/forge-wizard/gui.model";
import { History } from "app/space/forge-wizard/history.component";
import { AnalyzeOverviewComponent } from "app/space/analyze/analyze-overview/analyze-overview.component";
import { NgForm, FormControl, Validators, FormGroup } from "@angular/forms";

@Component({
  selector: 'forge-wizard',
  templateUrl: './forge-wizard.component.html',
  styleUrls: ['./forge-wizard.component.less']
})
export class ForgeWizardComponent implements OnInit {
  @ViewChild('wizard') wizard: WizardComponent;
  form: FormGroup = new FormGroup({});
  stepGithubImportPickOrganisation: WizardStepConfig;
  stepGithubRepositories: WizardStepConfig;
  stepConfigurePipeline: WizardStepConfig;
  stepCreateBuildConfig: WizardStepConfig;
  config: WizardConfig;
  history: History = new History();

  constructor(private parent: AnalyzeOverviewComponent, private forgeService: ForgeService) {
    this.config = {
      title: 'Import booster',
      stepStyleClass: 'wizard'
    } as WizardConfig;

    this.stepGithubImportPickOrganisation = {
      id: 'GithubImportPickOrganisationStep',
      priority: 0,
      title: 'Github Organisation'
    } as WizardStepConfig;
    this.stepGithubRepositories = {
      id: 'GithubRepositoriesStep',
      priority: 1,
      title: 'Github Repositories'
    } as WizardStepConfig;
    this.stepConfigurePipeline = {
      id: 'ConfigurePipeline',
      priority: 2,
      title: 'Configure Pipeline'
    } as WizardStepConfig;
    this.stepCreateBuildConfig = {
      id: 'CreateBuildConfigStep',
      priority: 3,
      title: 'Build Config'
    } as WizardStepConfig;
  }

  get currentGui(): Gui {
    return this.history.currentGui;
  }

  toggleDropdown(): void {
    this.currentGui.inputs[0].name += "!";
    console.log(this.currentGui.inputs[0].name);
  }

  ngOnInit(): void {
    this.loadUi();
  }

  cancel($event) {
    this.parent.closeModal($event);
  }

  nextClicked($event: WizardEvent): void {
    console.log("valid?", this.form.valid);
    if (this.form.valid) {
      this.history.resetTo(this.history.stepIndex);
      this.loadUi();
    }
  }

  previousClicked($event: WizardEvent): void {
    this.history.resetTo(this.history.stepIndex - 1);
    this.history.done();
    this.form = this.buildForm(this.currentGui);
  }

  private loadUi(): void {
    this.forgeService.loadGui('fabric8-import-git', this.history).then((gui: Gui) => {
      this.history.add(gui);
      this.history.done();

      this.form = this.buildForm(gui);
    });
  }

  private buildForm(gui: Gui): FormGroup {
    let group: any = {};
    gui.inputs.forEach(sub => {
      let input = sub as Input;
      group[input.name] = input.required ? new FormControl(input.value || '', Validators.required)
          : new FormControl(input.value || '');
    });
    return new FormGroup(group);
  }
}
