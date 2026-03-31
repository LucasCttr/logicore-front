import LocationDto, { CreateLocationDto } from '../types/locations';
import api from './axiosClient';


export async function getLocations(): Promise<LocationDto[]> {
  const res = await api.get('/api/locations');
  return res.data;
}

export async function createLocation(payload: CreateLocationDto): Promise<LocationDto> {
  const res = await api.post('/api/locations', payload);
  return res.data;
}

export default {};
