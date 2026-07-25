import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SystemState {
  isOffline: boolean;
}

const initialState: SystemState = {
  isOffline: false,
};

const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setOffline: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
  },
});

export const { setOffline } = systemSlice.actions;
export default systemSlice.reducer;
