import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { combineLatest, map, takeWhile } from 'rxjs/operators';
import { CombErr } from '../../@dataflow/core';
import { CoreStatsFlow, CoreStatsFlowInNode, ListGroupFlow } from '../../@dataflow/rclone';
import { ConnectionService } from '../connection.service';

@Component({
	selector: 'app-jobs',
	template: `
		<nb-layout>
			<nb-sidebar tag="group">
				<nb-card-header>
					Groups
					<nb-icon icon="refresh" (click)="refreshList()"></nb-icon>
				</nb-card-header>
				<nb-list>
					<nb-list-item
						(click)="activateGroup('')"
						[ngClass]="{ 'active-group': activeGroup === '' }"
					>
						[all]
					</nb-list-item>
					<nb-list-item
						*ngFor="let item of groups"
						(click)="activateGroup(item)"
						[ngClass]="{ 'active-group': activeGroup === item }"
					>
						{{ item }}
					</nb-list-item>
				</nb-list>
			</nb-sidebar>

			<nb-layout-column style="padding: 0;">
				<div class="container">
					<div class="row">
						<div class="col-6">
							<nb-card size="small">
								<nb-card-header> Speed </nb-card-header>
								<nb-card-body class="speed-body">
									<app-jobs-speed-chart [stats$]="stats$"> </app-jobs-speed-chart>
								</nb-card-body>
							</nb-card>
						</div>
						<div class="col-6">
							<nb-card>
								<nb-card-header> Summary </nb-card-header>
								<nb-card-body>
									<app-jobs-summary [stats$]="stats$"> </app-jobs-summary>
								</nb-card-body>
							</nb-card>
						</div>
					</div>
					<div class="row">
						<div class="col">
							<nb-card>
								<nb-card-header> Transferring </nb-card-header>
								<nb-card-body>
									<app-jobs-transferring [stats$]="stats$"> </app-jobs-transferring>
								</nb-card-body>
							</nb-card>
						</div>
					</div>
				</div>
			</nb-layout-column>
		</nb-layout>
	`,
	styles: [
		`
			nb-sidebar {
				border-left: solid;
				border-color: #edf1f7;
				border-left-width: 0.0668rem;
			}
			:host ::ng-deep .scrollable {
				display: contents;
			}
			ul {
				list-style-type: none;
			}
			li {
				border-bottom: 1px solid #edf1f7;
			}
			div.row {
				padding-top: 1rem;
			}
			.active-group {
				background-color: lightcoral;
			}
			.speed-body {
				padding: 0;
				min-height: 10rem;
				overflow-y: hidden;
			}
		`,
	],
})
export class JobsComponent implements OnInit, OnDestroy {
	constructor(private cmdService: ConnectionService) {}
	public activeGroup = '';
	public groups: string[] = [];

	private listTrigger = new Subject<number>();
	public listGroup$: ListGroupFlow;

	private statsTrigger = new Subject<string>();
	public stats$: CoreStatsFlow;

	private visable = false;

	public activateGroup(group: string) {
		this.activeGroup = group;
		this.statsTrigger.next(group);
	}
	ngOnInit(): void {
		const outer = this;
		this.visable = true;
		this.listGroup$ = new (class extends ListGroupFlow {
			public prerequest$ = outer.listTrigger.pipe(
				combineLatest(outer.cmdService.listCmd$.verify(this.cmd)),
				map(([, node]) => node)
			);
		})();
		this.listGroup$.deploy();
		this.listGroup$.getOutput().subscribe(x => {
			if (x[1].length !== 0) return;
			this.groups = x[0].groups;
		});
		this.listTrigger.next(1);

		this.stats$ = new (class extends CoreStatsFlow {
			public prerequest$ = outer.cmdService.rst$.getOutput().pipe(
				takeWhile(() => outer.visable),
				combineLatest(outer.statsTrigger, outer.cmdService.listCmd$.verify(this.cmd)),
				map(
					([, group, node]): CombErr<CoreStatsFlowInNode> => {
						if (node[1].length !== 0) return [{}, node[1]] as any;
						if (group === '') return node;
						return [{ ...node[0], group }, []];
					}
				)
			);
		})();
		this.stats$.deploy();
		this.statsTrigger.next('');
	}

	public refreshList() {
		this.listTrigger.next(1);
	}
	ngOnDestroy() {
		this.visable = false;
	}
}
