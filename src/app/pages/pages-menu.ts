import { group } from '@angular/animations';
import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
	{
		title: 'User',
		icon: 'people-outline',
		children: [
			{
				title: 'Manage',
				icon: 'grid-outline',
				link: 'user',
			},
		],
	},
	{
		title: 'Dashboard',
		icon: 'home-outline',
		link: 'dashboard',
		home: true,
	},
	{
		title: 'File Manager',
		icon: 'folder-outline',
		link: 'manager',
	},
	{
		title: 'Jobs Manager',
		icon: 'briefcase-outline',
		link: 'jobs',
	},
	{
		title: 'Settings',
		group: true,
	},
	{
		title: 'Server Setting',
		icon: 'settings-2-outline', // todo: ng g module pages/settings/server --module app --route settings/server
	},
	{
		title: 'Appearance Setting',
		icon: 'browser-outline', // todo: ng g module pages/settings/rng --module app --route settings/rng
	},
];
