package service

import (
	"github.com/am-info/admin-service/internal/repository"
)

type AdminService struct {
	repo      *repository.ClientRepository
	statsRepo *repository.StatsRepository
	discRepo  *repository.DiscountRepository
	logsRepo  *repository.LogsRepository
}

func NewAdminService(repo *repository.ClientRepository, statsRepo *repository.StatsRepository, discRepo *repository.DiscountRepository, logsRepo *repository.LogsRepository) *AdminService {
	return &AdminService{repo: repo, statsRepo: statsRepo, discRepo: discRepo, logsRepo: logsRepo}
}

func (s *AdminService) GetClients() ([]map[string]interface{}, error) { return s.repo.GetClients() }
func (s *AdminService) GetClientEmails() ([]map[string]string, error)  { return s.repo.GetClientEmails() }
func (s *AdminService) GetStats() (map[string]interface{}, error)       { return s.statsRepo.GetDashboardStats() }
func (s *AdminService) GetDiscounts() ([]map[string]interface{}, error) { return s.discRepo.GetAll() }
func (s *AdminService) CreateDiscount(data map[string]interface{}) (map[string]interface{}, error) { return s.discRepo.Create(data) }
func (s *AdminService) ToggleDiscount(id string) error                   { return s.discRepo.Toggle(id) }
func (s *AdminService) DeleteDiscount(id string) error                   { return s.discRepo.Delete(id) }
func (s *AdminService) GetLogs(limit int, action, entity string) ([]map[string]interface{}, error) { return s.logsRepo.GetRecent(limit, action, entity) }
func (s *AdminService) GetLogStats() (map[string]interface{}, error)     { return s.logsRepo.GetStats() }
func (s *AdminService) LogActivity(userID, action, entity, entityID, details, ip string) {
	s.logsRepo.LogActivity(userID, "", "", action, entity, entityID, details, ip)
}
