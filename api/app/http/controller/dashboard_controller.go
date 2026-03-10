package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type DashboardController struct{}

func NewDashboardController() *DashboardController {
	return &DashboardController{}
}

func (ctrl *DashboardController) Index(c *gin.Context) {
	c.String(http.StatusOK, "dashboard")
}
