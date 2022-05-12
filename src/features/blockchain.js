import { createSlice } from '@reduxjs/toolkit';

const initialData = { account: "", balance: 0, network: "" }
export const blockchainSlice = createSlice({
    name: "blockchain",
    initialState: { value: initialData },
    reducers: {
        updateAccountData: (state, action) => {
            state.value = action.payload
        },
        disconnect: (state) => {
            state.value = initialData
        }
    },
}
)

export default blockchainSlice.reducer;

export const { updateAccountData, disconnect } = blockchainSlice.actions;
