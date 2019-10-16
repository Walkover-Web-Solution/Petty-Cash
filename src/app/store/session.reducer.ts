import {AuthActionsUnion, AuthActionType} from '../actions/auth/auth.action';
import {LoginResponseModel} from '../models/login.model';

export interface SessionState {
    data: LoginResponseModel;
    isLoginWithPasswordInProcess: boolean;
    activeCompany: string;
}

const initialState: SessionState = {
    activeCompany: '',
    data: null,
    isLoginWithPasswordInProcess: false
};


export function SessionReducer(state: SessionState = initialState, action: AuthActionsUnion) {
    switch (action.type) {
        case AuthActionType.LoginUser: {
            return {
                ...state,
                isLoginWithPasswordInProcess: true,
                data: null
            };
        }

        case AuthActionType.LoginUserComplete: {
            return {
                ...state,
                isLoginWithPasswordInProcess: false,
                data: action.result
            };
        }

        case AuthActionType.SetActiveCompany: {
            return {
                ...state,
                activeCompany: action.uniqueName
            };
        }

        case AuthActionType.LogoutUser: {
            return {
                ...state,
                isLoginWithPasswordInProcess: false,
                data: null,
                activeCompany: ''
            };
        }
        default:
            return state;
    }
}