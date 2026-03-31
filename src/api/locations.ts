import LocationDto, { CreateLocationDto } from '../types/locations';
import api from './axiosClient';


export async function getLocations(): Promise<LocationDto[]> {
  const res = await api.get('/api/locations');
  const payload: any = res.data;
  return payload?.value ?? payload?.Value ?? payload;
}

export async function createLocation(payload: CreateLocationDto): Promise<LocationDto> {
  const res = await api.post('/api/locations', payload);
  const result: any = res.data;
  return result?.value ?? result?.Value ?? result;
}

export default {};
