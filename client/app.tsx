import {
  CssBaseline,
  Typography,
  TextField,
  TextFieldProps,
  Button,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  SelectChangeEvent,
  FormControl,
  InputLabel,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import './app.css';
import { Areas } from './lib/constants';

interface FilterRowProps {
  label: string;
  content: React.ReactNode;
}
const FilterRow = ({ label, content }: FilterRowProps) => {
  return (
    <div className="filter-row">
      <div className="filter-row-label">{label}</div>
      <div className="filter-row-content">{content}</div>
    </div>
  );
};

const FilterField = (props: TextFieldProps) => {
  return (
    <TextField
      className="filter-field"
      variant="standard"
      margin="none"
      placeholder="any"
      {...props}
      InputLabelProps={{
        shrink: true,
        ...(props.InputLabelProps ?? {}),
      }}
    />
  );
};

interface SizeFiltersProps {
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}
const SizeFilters = ({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}: SizeFiltersProps) => {
  const numsOnly = (value: string) => {
    return /^[0-9]*\.?[0-9]*$/.test(value);
  };

  const toNumber = (value: string) => {
    return value === '.' ? 0 : Number(value);
  }

  return (
    <>
      <FilterField
        value={minValue ?? ''}
        onChange={(e) => {
          const value = e.target.value;
          if (value === '') {
            onMinChange(null);
            return;
          }
          if (numsOnly(value)) {
            const numeric = toNumber(value);
            if (maxValue !== null && numeric > maxValue) {
              onMaxChange(numeric);
            }
            onMinChange(numeric);
          }
        }}
        label="min"
        style={{ marginRight: 8 }}
      />
      <FilterField
        value={maxValue ?? ''}
        onChange={(e) => {
          const value = e.target.value;
          if (value === '') {
            onMaxChange(null);
            return;
          }
          if (numsOnly(value)) {
            const numeric = toNumber(value);
            if (minValue !== null && numeric < minValue) {
              onMinChange(numeric);
            }
            onMaxChange(numeric);
          }
        }}
        label="max"
      />
    </>
  );
};

export const App = () => {
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(null);
  const [updating, setUpdating] = useState(false);
  const [minSize, setMinSize] = useState<number>(null);
  const [maxSize, setMaxSize] = useState<number>(null);
  const [minFloor, setMinFloor] = useState<number>(null);
  const [maxFloor, setMaxFloor] = useState<number>(null);
  const [minRooms, setMinRooms] = useState<number>(null);
  const [maxRooms, setMaxRooms] = useState<number>(null);
  const [minPrice, setMinPrice] = useState<number>(null);
  const [maxPrice, setMaxPrice] = useState<number>(null);
  const [selectedArea, setSelectedArea] = useState<typeof Areas[number]>(null);

  const retrieveFilters = async () => {
    const response = await fetch('/api/getFilters');
    const retrievedFilters = (await response.json()).data;
    Object.entries(retrievedFilters).forEach(([key, value]) => {
      if (value === -1) {
        retrievedFilters[key] = null;
      }
    });
    setMinSize(retrievedFilters.minSize);
    setMaxSize(retrievedFilters.maxSize);
    setMinFloor(retrievedFilters.minFloor);
    setMaxFloor(retrievedFilters.maxFloor);
    setMinRooms(retrievedFilters.minRooms);
    setMaxRooms(retrievedFilters.maxRooms);
    setMinPrice(retrievedFilters.minPrice);
    setMaxPrice(retrievedFilters.maxPrice);
    setFiltersLoaded(true);
  };

  const updateFilters = async () => {
    setUpdating(true);
    setUpdateSuccess(null);
    const formattedFilters: any = {
      minSize: minSize ?? -1,
      maxSize: maxSize ?? -1,
      minFloor: minFloor ?? -1,
      maxFloor: maxFloor ?? -1,
      minRooms: minRooms ?? -1,
      maxRooms: maxRooms ?? -1,
      minPrice: minPrice ?? -1,
      maxPrice: maxPrice ?? -1,
    };
    if (selectedArea) {
      formattedFilters.topArea = Number(selectedArea.complex_id.topArea);
      if (formattedFilters.complex_id.area) {
        formattedFilters.area = Number(formattedFilters.complex_id.area)
      }
    }
    const response = await fetch('/api/updateFilters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedFilters),
    });
    setUpdateSuccess(response.ok);
    setUpdating(false);
  };

  useEffect(() => {
    retrieveFilters();
  }, []);

  return (
    <CssBaseline>
      <div className="app-container">
        <Typography variant="h3" className="filter-title">
          Choose search filters
        </Typography>
        {filtersLoaded ? (
          <div className="filter-container">
            {/* <FilterRow
              label="Area"
              content={
                <FormControl fullWidth>
                  <InputLabel id="select-label">Select Area</InputLabel>
                  <Select fullWidth variant="standard" labelId="select-label">
                    {Areas.map((area) => {
                      const { value, isGroupHeader, complex_id, text } = area;
                      const selected = selectedArea?.value === area.value;
                      const marginRight = isGroupHeader ? 0 : 24;
                      const fontWeight = selected ? 'bold' : '';

                      return (
                        <MenuItem key={value} value={value}>
                          <ListItemText
                            primary={
                              <div
                                style={{
                                  textAlign: 'right',
                                  marginRight,
                                  fontWeight,
                                }}
                              >
                                {text}
                              </div>
                            }
                          />
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              }
            /> */}
            <FilterRow
              label="Size (m²)"
              content={
                <SizeFilters
                  minValue={minSize}
                  maxValue={maxSize}
                  onMinChange={setMinSize}
                  onMaxChange={setMaxSize}
                />
              }
            />
            <FilterRow
              label="Floor"
              content={
                <SizeFilters
                  minValue={minFloor}
                  maxValue={maxFloor}
                  onMinChange={setMinFloor}
                  onMaxChange={setMaxFloor}
                />
              }
            />
            <FilterRow
              label="Rooms"
              content={
                <SizeFilters
                  minValue={minRooms}
                  maxValue={maxRooms}
                  onMinChange={setMinRooms}
                  onMaxChange={setMaxRooms}
                />
              }
            />
            <FilterRow
              label="Rent (₪)"
              content={
                <SizeFilters
                  minValue={minPrice}
                  maxValue={maxPrice}
                  onMinChange={setMinPrice}
                  onMaxChange={setMaxPrice}
                />
              }
            />
            <Button
              onClick={updateFilters}
              variant="contained"
              className="submit-button"
              disabled={updating}
            >
              submit change
              {updating && (
                <CircularProgress
                  size={30}
                  className="updating-loading-circle"
                />
              )}
            </Button>
            {updateSuccess && <Alert severity="success">Filters updated</Alert>}
            {updateSuccess === false && (
              <Alert severity="error">Filter update failed</Alert>
            )}
          </div>
        ) : (
          'Loading filters...'
        )}
      </div>
    </CssBaseline>
  );
};
