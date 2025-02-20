import type {RouteProp} from '@react-navigation/native';
import {useNavigationState} from '@react-navigation/native';
import type {ComponentType, ForwardedRef, RefAttributes} from 'react';
import React, {forwardRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {AuthScreensParamList, BottomTabNavigatorParamList, FullScreenNavigatorParamList, ReimbursementAccountNavigatorParamList, SettingsNavigatorParamList} from '@navigation/types';
import * as Policy from '@userActions/Policy/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

type NavigatorsParamList = BottomTabNavigatorParamList & AuthScreensParamList & SettingsNavigatorParamList & ReimbursementAccountNavigatorParamList & FullScreenNavigatorParamList;

type PolicyRoute = RouteProp<
    NavigatorsParamList,
    | typeof SCREENS.REIMBURSEMENT_ACCOUNT_ROOT
    | typeof SCREENS.WORKSPACE.INITIAL
    | typeof SCREENS.WORKSPACE.PROFILE
    | typeof SCREENS.WORKSPACE.BILLS
    | typeof SCREENS.WORKSPACE.MORE_FEATURES
    | typeof SCREENS.WORKSPACE.MEMBERS
    | typeof SCREENS.WORKSPACE.EXPENSIFY_CARD
    | typeof SCREENS.WORKSPACE.INVITE
    | typeof SCREENS.WORKSPACE.INVITE_MESSAGE
    | typeof SCREENS.WORKSPACE.WORKFLOWS_PAYER
    | typeof SCREENS.WORKSPACE.WORKFLOWS
    | typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_NEW
    | typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EDIT
    | typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EXPENSES_FROM
    | typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER
    | typeof SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_MONTHLY_OFFSET
    | typeof SCREENS.WORKSPACE.TRAVEL
    | typeof SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_FREQUENCY
    | typeof SCREENS.WORKSPACE.MEMBER_DETAILS
    | typeof SCREENS.WORKSPACE.INVOICES
    | typeof SCREENS.WORKSPACE.CARD
    | typeof SCREENS.WORKSPACE.OWNER_CHANGE_CHECK
    | typeof SCREENS.WORKSPACE.TAX_EDIT
    | typeof SCREENS.WORKSPACE.ADDRESS
    | typeof SCREENS.WORKSPACE.DISTANCE_RATE_TAX_RATE_EDIT
    | typeof SCREENS.WORKSPACE.DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT
    | typeof SCREENS.WORKSPACE.REPORT_FIELDS_CREATE
    | typeof SCREENS.WORKSPACE.REPORT_FIELDS_LIST_VALUES
    | typeof SCREENS.WORKSPACE.REPORT_FIELDS_EDIT_INITIAL_VALUE
    | typeof SCREENS.WORKSPACE.REPORT_FIELDS_VALUE_SETTINGS
    | typeof SCREENS.WORKSPACE.ACCOUNTING.CARD_RECONCILIATION
    | typeof SCREENS.WORKSPACE.RULES
>;

function getPolicyIDFromRoute(route: PolicyRoute): string {
    return route?.params?.policyID ?? '-1';
}

type WithPolicyOnyxProps = {
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyDraft: OnyxEntry<OnyxTypes.Policy>;
};

type WithPolicyProps = WithPolicyOnyxProps & {
    route: PolicyRoute;
};

const policyDefaultProps: WithPolicyOnyxProps = {
    policy: {} as OnyxTypes.Policy,
    policyDraft: {} as OnyxTypes.Policy,
};

/*
 * HOC for connecting a policy in Onyx corresponding to the policyID in route params
 */
export default function <TProps extends WithPolicyProps, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>): React.ComponentType<Omit<TProps, keyof WithPolicyOnyxProps>> {
    function WithPolicy(props: TProps, ref: ForwardedRef<TRef>) {
        const routes = useNavigationState((state) => state.routes || []);
        const currentRoute = routes?.at(-1);
        const policyID = getPolicyIDFromRoute(currentRoute as PolicyRoute);

        if (policyID.length > 0) {
            Policy.updateLastAccessedWorkspace(policyID);
        }

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={ref}
            />
        );
    }

    WithPolicy.displayName = `WithPolicy`;

    return withOnyx<TProps & RefAttributes<TRef>, WithPolicyOnyxProps>({
        policy: {
            key: (props) => `${ONYXKEYS.COLLECTION.POLICY}${getPolicyIDFromRoute(props.route)}`,
        },
        policyDraft: {
            key: (props) => `${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${getPolicyIDFromRoute(props.route)}`,
        },
    })(forwardRef(WithPolicy));
}

export {policyDefaultProps};
export type {PolicyRoute, WithPolicyOnyxProps, WithPolicyProps};
